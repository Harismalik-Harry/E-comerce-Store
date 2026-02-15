const orderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /api/orders/checkout
 */
const checkout = catchAsync(async (req, res) => {
    const { shipping_address } = req.body;

    if (!shipping_address) {
        return res.status(400).json({ error: "shipping_address is required" });
    }

    const order = await orderService.checkout(req.user.id, shipping_address);
    res.status(201).json({ message: "Order placed successfully", order });
});

/**
 * GET /api/orders
 */
const getUserOrders = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await orderService.getUserOrders(req.user.id, { page, limit });
    res.json(data);
});

/**
 * GET /api/orders/:id
 */
const getOrderById = catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ order });
});

/**
 * GET /api/orders/seller/list
 */
const getSellerOrders = catchAsync(async (req, res) => {
    const { status, page, limit } = req.query;
    const data = await orderService.getSellerOrders(req.user.id, { status, page, limit });
    res.json(data);
});

/**
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = catchAsync(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "status is required" });
    }

    const order = await orderService.updateOrderStatus(req.user.id, req.params.id, status);
    res.json({ message: "Order status updated", order });
});

module.exports = { checkout, getUserOrders, getOrderById, getSellerOrders, updateOrderStatus };
