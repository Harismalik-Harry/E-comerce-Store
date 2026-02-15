const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

/**
 * Get the user's cart with product details
 */
const getCart = async (userId) => {
    const result = await db.query(
        `SELECT ci.id, ci.quantity, ci.created_at,
       p.id AS product_id, p.name, p.price, p.image_url, p.stock_quantity,
       s.name AS store_name
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN stores s ON s.id = p.store_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
        [userId]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items, total: parseFloat(total.toFixed(2)), count: items.length };
};

/**
 * Add item to cart (or update quantity if already exists)
 * Transaction: lock product row → validate stock → upsert cart
 * Prevents race condition where stock could go negative
 */
const addToCart = async (userId, productId, quantity = 1) => {
    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the product row to prevent race conditions on stock check
        const product = await client.query(
            "SELECT id, stock_quantity, is_active FROM products WHERE id = $1 FOR SHARE",
            [productId]
        );
        if (product.rows.length === 0 || !product.rows[0].is_active) {
            throw new ApiError(404, "Product not found or unavailable");
        }

        // Check existing cart quantity + new quantity against stock
        const existingCart = await client.query(
            "SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
            [userId, productId]
        );
        const existingQty = existingCart.rows.length > 0 ? existingCart.rows[0].quantity : 0;
        const totalQty = existingQty + quantity;

        if (product.rows[0].stock_quantity < totalQty) {
            throw new ApiError(400, "Not enough stock available");
        }

        // Upsert: insert or update quantity
        const result = await client.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + $3
             RETURNING *`,
            [userId, productId, quantity]
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
 * Update cart item quantity
 * Transaction: validate stock → update cart
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
    if (quantity <= 0) {
        return removeFromCart(userId, cartItemId);
    }

    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Get cart item and lock the associated product
        const cartItem = await client.query(
            `SELECT ci.product_id, p.stock_quantity
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.id = $1 AND ci.user_id = $2
             FOR UPDATE OF ci`,
            [cartItemId, userId]
        );

        if (cartItem.rows.length === 0) {
            throw new ApiError(404, "Cart item not found");
        }

        if (cartItem.rows[0].stock_quantity < quantity) {
            throw new ApiError(400, "Not enough stock available");
        }

        const result = await client.query(
            `UPDATE cart_items SET quantity = $1
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [quantity, cartItemId, userId]
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
 * Remove item from cart
 */
const removeFromCart = async (userId, cartItemId) => {
    const result = await db.query(
        "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
        [cartItemId, userId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, "Cart item not found");
    }

    return { message: "Item removed from cart" };
};

/**
 * Clear entire cart
 */
const clearCart = async (userId) => {
    await db.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    return { message: "Cart cleared" };
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
