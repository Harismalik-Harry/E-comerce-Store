const storeService = require("../services/store.service");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /api/stores
 */
const createStore = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Store name is required" });
    }

    const store = await storeService.createStore(req.user.id, {
        name,
        description,
    });

    res.status(201).json({ message: "Store created successfully", store });
});

/**
 * PUT /api/stores
 */
const updateStore = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    const store = await storeService.updateStore(req.user.id, {
        name,
        description,
    });

    res.json({ message: "Store updated successfully", store });
});

/**
 * GET /api/stores/me
 */
const getMyStore = catchAsync(async (req, res) => {
    const store = await storeService.getMyStore(req.user.id);
    res.json({ store });
});

/**
 * GET /api/stores/:id
 */
const getStoreById = catchAsync(async (req, res) => {
    const store = await storeService.getStoreById(req.params.id);
    res.json({ store });
});

/**
 * GET /api/stores
 */
const getAllStores = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await storeService.getAllStores({ page, limit });
    res.json(data);
});
/**
 * GET /api/stores/me/revenue
 */
const getStoreRevenue = catchAsync(async (req, res) => {
    const { start_date, end_date } = req.query;
    const revenue = await storeService.getStoreRevenue(req.user.id, { start_date, end_date });
    res.json({ revenue });
});

module.exports = { createStore, updateStore, getMyStore, getStoreById, getAllStores, getStoreRevenue };
