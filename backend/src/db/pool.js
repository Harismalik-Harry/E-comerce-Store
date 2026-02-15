const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test connection on startup
pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
    console.error("❌ Unexpected PostgreSQL error:", err);
    process.exit(-1);
});

/**
 * Helper: run a query
 * Usage: const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
