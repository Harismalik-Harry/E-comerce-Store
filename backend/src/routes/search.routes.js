const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");

// Public
router.get("/", searchController.searchProducts);

module.exports = router;
