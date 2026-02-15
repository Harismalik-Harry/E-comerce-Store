const searchService = require("../services/search.service");
const catchAsync = require("../utils/catchAsync");

/**
 * GET /api/search
 */
const searchProducts = catchAsync(async (req, res) => {
    const { q, category, min_price, max_price, sort_by, page, limit } = req.query;
    const data = await searchService.searchProducts({
        q, category, min_price, max_price, sort_by, page, limit,
    });
    res.json(data);
});

module.exports = { searchProducts };
