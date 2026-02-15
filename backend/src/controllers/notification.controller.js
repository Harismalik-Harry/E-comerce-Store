const notificationService = require("../services/notification.service");
const catchAsync = require("../utils/catchAsync");

/**
 * GET /api/notifications
 */
const getNotifications = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await notificationService.getNotifications(req.user.id, { page, limit });
    res.json(data);
});

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = catchAsync(async (req, res) => {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    res.json({ message: "Marked as read", notification });
});

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = catchAsync(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json(result);
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
