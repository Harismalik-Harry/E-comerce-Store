const productService = require("../services/product.service");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /api/products
 */
const createProduct = catchAsync(async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "name and price are required" });
    }

    const product = await productService.createProduct(
        req.user.id,
        req.body,
        req.file
    );

    res.status(201).json({ message: "Product created successfully", product });
});

/**
 * PUT /api/products/:id
 */
const updateProduct = catchAsync(async (req, res) => {
    const product = await productService.updateProduct(
        req.user.id,
        req.params.id,
        req.body,
        req.file
    );

    res.json({ message: "Product updated successfully", product });
});

/**
 * DELETE /api/products/:id
 */
const deleteProduct = catchAsync(async (req, res) => {
    const result = await productService.deleteProduct(req.user.id, req.params.id);
    res.json(result);
});

/**
 * GET /api/products/:id
 */
const getProductById = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json({ product });
});

/**
 * GET /api/products
 */
const getProducts = catchAsync(async (req, res) => {
    const { store_id, category, page, limit } = req.query;
    const data = await productService.getProducts({ store_id, category, page, limit });
    res.json(data);
});

/**
 * GET /api/products/my/list
 */
const getMyProducts = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await productService.getMyProducts(req.user.id, { page, limit });
    res.json(data);
});

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProducts,
    getMyProducts,
};
