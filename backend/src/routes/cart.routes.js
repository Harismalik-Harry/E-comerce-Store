const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/clear", cartController.clearCart);
router.delete("/:id", cartController.removeFromCart);

module.exports = router;
