const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Public — get reviews
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/store/:storeId", reviewController.getStoreReviews);

// Authenticated — add/delete reviews
router.post("/product/:productId", authenticate, reviewController.addProductReview);
router.post("/store/:storeId", authenticate, reviewController.addStoreReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;
