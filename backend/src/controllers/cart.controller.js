const cartService = require("../services/cart.service");
const catchAsync = require("../utils/catchAsync");

/**
 * GET /api/cart
 */
const getCart = catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
});

/**
 * POST /api/cart
 */
const addToCart = catchAsync(async (req, res) => {
    const { product_id, quantity } = req.body;

    if (!product_id) {
        return res.status(400).json({ error: "product_id is required" });
    }

    const item = await cartService.addToCart(req.user.id, product_id, quantity);
    res.status(201).json({ message: "Added to cart", item });
});

/**
 * PUT /api/cart/:id
 */
const updateCartItem = catchAsync(async (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined) {
        return res.status(400).json({ error: "quantity is required" });
    }

    const item = await cartService.updateCartItem(req.user.id, req.params.id, quantity);
    res.json({ message: "Cart updated", item });
});

/**
 * DELETE /api/cart/:id
 */
const removeFromCart = catchAsync(async (req, res) => {
    const result = await cartService.removeFromCart(req.user.id, req.params.id);
    res.json(result);
});

/**
 * DELETE /api/cart
 */
const clearCart = catchAsync(async (req, res) => {
    const result = await cartService.clearCart(req.user.id);
    res.json(result);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
