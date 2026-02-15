const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

/**
 * Create a store for a seller (one store per seller)
 * Transaction: lock seller row → check existing → insert store
 * Prevents race condition on duplicate store creation
 */
const createStore = async (sellerId, { name, description }) => {
    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the seller's user row to prevent concurrent store creation
        await client.query(
            "SELECT id FROM users WHERE id = $1 FOR UPDATE",
            [sellerId]
        );

        // Check if seller already has a store
        const existing = await client.query(
            "SELECT id FROM stores WHERE seller_id = $1",
            [sellerId]
        );
        if (existing.rows.length > 0) {
            throw new ApiError(409, "You already have a store");
        }

        const result = await client.query(
            `INSERT INTO stores (seller_id, name, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [sellerId, name, description]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Update a seller's store
 */
const updateStore = async (sellerId, { name, description }) => {
    const result = await db.query(
        `UPDATE stores
     SET name = COALESCE($1, name),
         description = COALESCE($2, description)
     WHERE seller_id = $3
     RETURNING *`,
        [name, description, sellerId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Store not found");
    }

    return result.rows[0];
};

/**
 * Get the current seller's store — uses v_store_dashboard view
 */
const getMyStore = async (sellerId) => {
    const result = await db.query(
        "SELECT * FROM v_store_dashboard WHERE seller_id = $1",
        [sellerId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "You don't have a store yet");
    }

    return result.rows[0];
};

/**
 * Get a store by its ID (public) — uses v_store_dashboard view
 */
const getStoreById = async (storeId) => {
    const result = await db.query(
        "SELECT * FROM v_store_dashboard WHERE id = $1",
        [storeId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Store not found");
    }

    return result.rows[0];
};

/**
 * Get all stores (public, with pagination) — uses v_store_dashboard view
 */
const getAllStores = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query("SELECT COUNT(*) FROM stores");
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT * FROM v_store_dashboard
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return {
        stores: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};
/**
 * Get store revenue analytics — uses fn_store_revenue DB function
 */
const getStoreRevenue = async (sellerId, { start_date, end_date } = {}) => {
    const storeResult = await db.query(
        "SELECT id FROM stores WHERE seller_id = $1",
        [sellerId]
    );
    if (storeResult.rows.length === 0) {
        throw new ApiError(404, "Store not found");
    }

    const result = await db.query(
        "SELECT * FROM fn_store_revenue($1, $2, $3)",
        [storeResult.rows[0].id, start_date || null, end_date || null]
    );

    return result.rows[0];
};

module.exports = { createStore, updateStore, getMyStore, getStoreById, getAllStores, getStoreRevenue };
