const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

/**
 * Add a review for a product
 */
const addProductReview = async (userId, productId, { rating, comment }) => {
    // Check if product exists
    const product = await db.query("SELECT id, store_id FROM products WHERE id = $1", [productId]);
    if (product.rows.length === 0) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user already reviewed this product
    const existing = await db.query(
        "SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2",
        [userId, productId]
    );
    if (existing.rows.length > 0) {
        throw new ApiError(409, "You already reviewed this product");
    }

    const result = await db.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [userId, productId, rating, comment]
    );

    // Rating auto-updated by trg_review_rating trigger
    return result.rows[0];
};

/**
 * Add a review for a store
 */
const addStoreReview = async (userId, storeId, { rating, comment }) => {
    // Check if store exists
    const store = await db.query("SELECT id FROM stores WHERE id = $1", [storeId]);
    if (store.rows.length === 0) {
        throw new ApiError(404, "Store not found");
    }

    // Check if user already reviewed this store
    const existing = await db.query(
        "SELECT id FROM reviews WHERE user_id = $1 AND store_id = $2",
        [userId, storeId]
    );
    if (existing.rows.length > 0) {
        throw new ApiError(409, "You already reviewed this store");
    }

    const result = await db.query(
        `INSERT INTO reviews (user_id, store_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [userId, storeId, rating, comment]
    );

    // Rating auto-updated by trg_review_rating trigger
    return result.rows[0];
};

/**
 * Get reviews for a product
 */
const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
        "SELECT COUNT(*) FROM reviews WHERE product_id = $1",
        [productId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT r.*, u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
    );

    return {
        reviews: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get reviews for a store
 */
const getStoreReviews = async (storeId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
        "SELECT COUNT(*) FROM reviews WHERE store_id = $1",
        [storeId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT r.*, u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
        [storeId, limit, offset]
    );

    return {
        reviews: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Delete a review (only the reviewer can delete)
 */
const deleteReview = async (userId, reviewId) => {
    const result = await db.query(
        "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id",
        [reviewId, userId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "Review not found or you don't own it");
    }
    return { message: "Review deleted" };
};

// Rating recalculation functions removed — handled by trg_review_rating trigger

module.exports = {
    addProductReview,
    addStoreReview,
    getProductReviews,
    getStoreReviews,
    deleteReview,
};
