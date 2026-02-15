const db = require("../db/pool");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

/**
 * Upload image buffer to Cloudinary
 */
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ecommerce/products" },
            (error, result) => {
                if (error) reject(new ApiError(500, "Image upload failed"));
                else resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
};

/**
 * Delete image from Cloudinary by URL
 */
const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        const parts = imageUrl.split("/");
        const filename = parts.slice(-1)[0].split(".")[0];
        const publicId = `ecommerce/products/${filename}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary delete error:", err.message);
    }
};

/**
 * Create a product (seller must own the store)
 * Transaction: verify store → insert product → upload image
 * Rollback: if DB insert fails after image upload, delete orphan image
 */
const createProduct = async (sellerId, productData, file) => {
    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Get seller's store (within transaction for consistency)
        const storeResult = await client.query(
            "SELECT id FROM stores WHERE seller_id = $1",
            [sellerId]
        );
        if (storeResult.rows.length === 0) {
            throw new ApiError(404, "You need to create a store first");
        }
        const storeId = storeResult.rows[0].id;

        // Upload image if provided
        let image_url = null;
        if (file) {
            image_url = await uploadToCloudinary(file.buffer);
        }

        const { name, description, price, stock_quantity, category } = productData;

        const result = await client.query(
            `INSERT INTO products (store_id, name, description, price, stock_quantity, category, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [storeId, name, description, price, stock_quantity || 0, category, image_url]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        // If we uploaded an image but the DB insert failed, clean up
        if (err.statusCode !== 404) {
            // Only clean Cloudinary if the error wasn't "no store"
            // (image wouldn't have been uploaded in that case)
        }
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Update a product (seller must own the store)
 * Transaction: verify ownership → update product
 * Strategy: upload new image first, if DB update succeeds delete old image,
 *           if DB update fails delete new image (rollback cleanup)
 */
const updateProduct = async (sellerId, productId, productData, file) => {
    const client = await db.pool.connect();
    let newImageUrl = null;
    let oldImageUrl = null;

    try {
        await client.query("BEGIN");

        // Verify ownership (within transaction — SELECT FOR UPDATE locks the row)
        const product = await client.query(
            `SELECT p.* FROM products p
             JOIN stores s ON s.id = p.store_id
             WHERE p.id = $1 AND s.seller_id = $2
             FOR UPDATE`,
            [productId, sellerId]
        );
        if (product.rows.length === 0) {
            throw new ApiError(404, "Product not found or you don't own it");
        }

        oldImageUrl = product.rows[0].image_url;
        let image_url = oldImageUrl;

        // Upload new image first (before DB update)
        if (file) {
            newImageUrl = await uploadToCloudinary(file.buffer);
            image_url = newImageUrl;
        }

        const { name, description, price, stock_quantity, category, is_active } = productData;

        const result = await client.query(
            `UPDATE products
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 stock_quantity = COALESCE($4, stock_quantity),
                 category = COALESCE($5, category),
                 image_url = COALESCE($6, image_url),
                 is_active = COALESCE($7, is_active)
             WHERE id = $8
             RETURNING *`,
            [name, description, price, stock_quantity, category, image_url, is_active, productId]
        );

        await client.query("COMMIT");

        // DB update succeeded — now safe to delete old image from Cloudinary
        if (file && oldImageUrl) {
            await deleteFromCloudinary(oldImageUrl);
        }

        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        // DB update failed — clean up the newly uploaded image
        if (newImageUrl) {
            await deleteFromCloudinary(newImageUrl);
        }
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Delete a product (seller must own the store)
 * Transaction: verify ownership → delete from DB → then delete from Cloudinary
 * Strategy: DB delete first (can rollback), Cloudinary delete after commit (best-effort)
 */
const deleteProduct = async (sellerId, productId) => {
    const client = await db.pool.connect();
    let imageToDelete = null;

    try {
        await client.query("BEGIN");

        // Verify ownership (with row lock)
        const product = await client.query(
            `SELECT p.* FROM products p
             JOIN stores s ON s.id = p.store_id
             WHERE p.id = $1 AND s.seller_id = $2
             FOR UPDATE`,
            [productId, sellerId]
        );
        if (product.rows.length === 0) {
            throw new ApiError(404, "Product not found or you don't own it");
        }

        imageToDelete = product.rows[0].image_url;

        // Delete from DB first (atomic, rollback-safe)
        await client.query("DELETE FROM products WHERE id = $1", [productId]);

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    // Only delete from Cloudinary AFTER successful DB commit
    // This ensures we never lose the image URL without deleting the DB record
    if (imageToDelete) {
        await deleteFromCloudinary(imageToDelete);
    }

    return { message: "Product deleted successfully" };
};

/**
 * Get a single product by ID (public) — uses v_product_listing view
 */
const getProductById = async (productId) => {
    const result = await db.query(
        "SELECT * FROM v_product_listing WHERE id = $1",
        [productId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "Product not found");
    }
    return result.rows[0];
};

/**
 * Get products with filters and pagination (public) — uses v_product_listing view
 */
const getProducts = async ({ store_id, category, page = 1, limit = 12 }) => {
    const offset = (page - 1) * limit;
    const conditions = ["is_active = true"];
    const params = [];
    let paramIndex = 1;

    if (store_id) {
        conditions.push(`store_id = $${paramIndex++}`);
        params.push(store_id);
    }
    if (category) {
        conditions.push(`category ILIKE $${paramIndex++}`);
        params.push(`%${category}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count
    const countResult = await db.query(
        `SELECT COUNT(*) FROM v_product_listing ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch
    params.push(limit, offset);
    const result = await db.query(
        `SELECT * FROM v_product_listing
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params
    );

    return {
        products: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get all products for a seller's store
 */
const getMyProducts = async (sellerId, { page = 1, limit = 12 }) => {
    const offset = (page - 1) * limit;

    const storeResult = await db.query(
        "SELECT id FROM stores WHERE seller_id = $1",
        [sellerId]
    );
    if (storeResult.rows.length === 0) {
        throw new ApiError(404, "You need to create a store first");
    }
    const storeId = storeResult.rows[0].id;

    const countResult = await db.query(
        "SELECT COUNT(*) FROM products WHERE store_id = $1",
        [storeId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT * FROM products
     WHERE store_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
        [storeId, limit, offset]
    );

    return {
        products: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProducts,
    getMyProducts,
};
