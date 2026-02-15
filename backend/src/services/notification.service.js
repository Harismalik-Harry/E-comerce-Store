const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

/**
 * Create a notification for a user
 */
const createNotification = async (userId, message, type = "general") => {
    const result = await db.query(
        `INSERT INTO notifications (user_id, message, type)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [userId, message, type]
    );
    return result.rows[0];
};

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1",
        [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const unreadResult = await db.query(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
        [userId]
    );
    const unread = parseInt(unreadResult.rows[0].count, 10);

    const result = await db.query(
        `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );

    return {
        notifications: result.rows,
        unread,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Mark a notification as read
 */
const markAsRead = async (userId, notificationId) => {
    const result = await db.query(
        `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
        [notificationId, userId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "Notification not found");
    }
    return result.rows[0];
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
    await db.query(
        "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
        [userId]
    );
    return { message: "All notifications marked as read" };
};

module.exports = { createNotification, getNotifications, markAsRead, markAllAsRead };
