const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Seller-only routes
router.post(
    "/",
    authenticate,
    authorize("seller"),
    upload.single("image"),
    productController.createProduct
);

router.put(
    "/:id",
    authenticate,
    authorize("seller"),
    upload.single("image"),
    productController.updateProduct
);

router.delete(
    "/:id",
    authenticate,
    authorize("seller"),
    productController.deleteProduct
);

router.get(
    "/my/list",
    authenticate,
    authorize("seller"),
    productController.getMyProducts
);

module.exports = router;
