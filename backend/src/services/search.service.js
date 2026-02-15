const db = require("../db/pool");

/**
 * Search products by keyword (name or description) with filters
 */
const searchProducts = async ({ q, category, min_price, max_price, sort_by, page = 1, limit = 12 }) => {
    const offset = (page - 1) * limit;
    const conditions = ["p.is_active = true"];
    const params = [];
    let paramIndex = 1;

    // Keyword search
    if (q) {
        conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
        params.push(`%${q}%`);
        paramIndex++;
    }

    // Category filter
    if (category) {
        conditions.push(`p.category ILIKE $${paramIndex++}`);
        params.push(`%${category}%`);
    }

    // Price range
    if (min_price) {
        conditions.push(`p.price >= $${paramIndex++}`);
        params.push(parseFloat(min_price));
    }
    if (max_price) {
        conditions.push(`p.price <= $${paramIndex++}`);
        params.push(parseFloat(max_price));
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Sort
    let orderClause = "ORDER BY p.created_at DESC";
    if (sort_by === "price_asc") orderClause = "ORDER BY p.price ASC";
    else if (sort_by === "price_desc") orderClause = "ORDER BY p.price DESC";
    else if (sort_by === "rating") orderClause = "ORDER BY p.average_rating DESC";
    else if (sort_by === "newest") orderClause = "ORDER BY p.created_at DESC";

    // Count
    const countResult = await db.query(
        `SELECT COUNT(*) FROM products p ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch
    params.push(limit, offset);
    const result = await db.query(
        `SELECT p.*, s.name AS store_name
     FROM products p
     JOIN stores s ON s.id = p.store_id
     ${whereClause}
     ${orderClause}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        params
    );

    return {
        products: result.rows,
        pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = { searchProducts };
