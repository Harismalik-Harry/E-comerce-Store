const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

/**
 * Checkout: uses fn_checkout stored procedure for atomic processing
 * The DB procedure handles: stock validation, order creation,
 * order items, stock reduction, and cart clearing — all in one transaction.
 * Triggers auto-notify the seller and guard against negative stock.
 */
const checkout = async (userId, shippingAddress) => {
    try {
        const result = await db.query(
            "SELECT fn_checkout($1, $2::jsonb) AS order_id",
            [userId, JSON.stringify(shippingAddress)]
        );
        const orderId = result.rows[0].order_id;
        return await getOrderById(orderId);
    } catch (err) {
        // Convert PostgreSQL RAISE EXCEPTION messages to ApiError
        if (err.message.includes("Cart is empty")) {
            throw new ApiError(400, "Your cart is empty");
        }
        if (err.message.includes("Insufficient stock")) {
            throw new ApiError(400, err.message);
        }
        if (err.message.includes("Stock cannot be negative")) {
            throw new ApiError(400, "Insufficient stock for one or more products");
        }
        throw err;
    }
};

/**
 * Get a single order with its items — uses v_order_summary view
 */
const getOrderById = async (orderId) => {
    const result = await db.query(
        "SELECT * FROM v_order_summary WHERE id = $1",
        [orderId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "Order not found");
    }
    return result.rows[0];
};

/**
 * Get all orders for a user — uses v_order_summary view
 */
const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
        "SELECT COUNT(*) FROM orders WHERE user_id = $1",
        [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT * FROM v_order_summary
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );

    return {
        orders: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get orders for a seller's store
 */
const getSellerOrders = async (sellerId, { status, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    // Get seller's store
    const storeResult = await db.query(
        "SELECT id FROM stores WHERE seller_id = $1",
        [sellerId]
    );
    if (storeResult.rows.length === 0) {
        throw new ApiError(404, "Store not found");
    }
    const storeId = storeResult.rows[0].id;

    const conditions = ["oi.store_id = $1"];
    const params = [storeId];
    let paramIndex = 2;

    if (status) {
        conditions.push(`o.status = $${paramIndex++}`);
        params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countResult = await db.query(
        `SELECT COUNT(DISTINCT o.id)
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await db.query(
        `SELECT DISTINCT ON (o.id) o.*, u.full_name AS customer_name,
       (SELECT json_agg(json_build_object(
         'product_name', p.name, 'quantity', oi2.quantity,
         'price', oi2.price_at_purchase
       ))
       FROM order_items oi2
       JOIN products p ON p.id = oi2.product_id
       WHERE oi2.order_id = o.id AND oi2.store_id = $1) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN users u ON u.id = o.user_id
     ${whereClause}
     ORDER BY o.id, o.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params
    );

    return {
        orders: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Update order status (seller)
 * Transaction: verify ownership → lock order → update status
 * Trigger trg_order_status_notify auto-notifies the customer (same transaction)
 */
const updateOrderStatus = async (sellerId, orderId, status) => {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Verify seller has items in this order
        const storeResult = await client.query(
            "SELECT id FROM stores WHERE seller_id = $1",
            [sellerId]
        );
        if (storeResult.rows.length === 0) {
            throw new ApiError(404, "Store not found");
        }

        // Lock the order row to prevent concurrent status changes
        const orderCheck = await client.query(
            `SELECT o.id FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             WHERE o.id = $1 AND oi.store_id = $2
             FOR UPDATE OF o`,
            [orderId, storeResult.rows[0].id]
        );
        if (orderCheck.rows.length === 0) {
            throw new ApiError(404, "Order not found or doesn't belong to your store");
        }

        const result = await client.query(
            "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
            [status, orderId]
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

module.exports = { checkout, getOrderById, getUserOrders, getSellerOrders, updateOrderStatus };
