const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", storeController.getAllStores);
router.get("/:id", storeController.getStoreById);

// Seller-only routes
router.post("/", authenticate, authorize("seller"), storeController.createStore);
router.put("/", authenticate, authorize("seller"), storeController.updateStore);
router.get("/me/dashboard", authenticate, authorize("seller"), storeController.getMyStore);
router.get("/me/revenue", authenticate, authorize("seller"), storeController.getStoreRevenue);

module.exports = router;
