const reviewService = require("../services/review.service");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /api/reviews/product/:productId
 */
const addProductReview = catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ error: "rating is required (1-5)" });

    const review = await reviewService.addProductReview(req.user.id, req.params.productId, { rating, comment });
    res.status(201).json({ message: "Review added", review });
});

/**
 * POST /api/reviews/store/:storeId
 */
const addStoreReview = catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ error: "rating is required (1-5)" });

    const review = await reviewService.addStoreReview(req.user.id, req.params.storeId, { rating, comment });
    res.status(201).json({ message: "Review added", review });
});

/**
 * GET /api/reviews/product/:productId
 */
const getProductReviews = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await reviewService.getProductReviews(req.params.productId, { page, limit });
    res.json(data);
});

/**
 * GET /api/reviews/store/:storeId
 */
const getStoreReviews = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await reviewService.getStoreReviews(req.params.storeId, { page, limit });
    res.json(data);
});

/**
 * DELETE /api/reviews/:id
 */
const deleteReview = catchAsync(async (req, res) => {
    const result = await reviewService.deleteReview(req.user.id, req.params.id);
    res.json(result);
});

module.exports = { addProductReview, addStoreReview, getProductReviews, getStoreReviews, deleteReview };
