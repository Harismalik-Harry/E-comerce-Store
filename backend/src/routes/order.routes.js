const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post("/checkout", orderController.checkout);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);

// Seller routes
router.get("/seller/list", authenticate, authorize("seller"), orderController.getSellerOrders);
router.patch("/:id/status", authenticate, authorize("seller"), orderController.updateOrderStatus);

module.exports = router;
