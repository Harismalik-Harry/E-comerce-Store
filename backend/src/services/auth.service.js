const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const db = require("../db/pool");
const ApiError = require("../utils/ApiError");

const SALT_ROUNDS = 10;

/**
 * Generate a JWT token for a user
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

/**
 * Register a new user (customer or seller)
 */
const register = async ({ email, password, full_name, role = "customer" }) => {
    // Check if user already exists
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
        email,
    ]);
    if (existing.rows.length > 0) {
        throw new ApiError(409, "Email already registered");
    }

    // Validate role
    const validRoles = ["customer", "seller"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, "Role must be 'customer' or 'seller'");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role, created_at`,
        [email, password_hash, full_name, role]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return { user, token };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {
    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    if (result.rows.length === 0) {
        throw new ApiError(401, "Invalid email or password");
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user);

    // Don't return password_hash
    const { password_hash, ...safeUser } = user;

    return { user: safeUser, token };
};

/**
 * Get user profile by ID
 */
const getProfile = async (userId) => {
    const result = await db.query(
        "SELECT id, email, full_name, role, created_at FROM users WHERE id = $1",
        [userId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "User not found");
    }
    return result.rows[0];
};

/**
 * Update user profile
 */
const updateProfile = async (userId, { full_name, password }) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (full_name) {
        fields.push(`full_name = $${paramIndex++}`);
        values.push(full_name);
    }

    if (password) {
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        fields.push(`password_hash = $${paramIndex++}`);
        values.push(password_hash);
    }

    if (fields.length === 0) {
        throw new ApiError(400, "Nothing to update");
    }

    values.push(userId);
    const result = await db.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING id, email, full_name, role, created_at`,
        values
    );
    if (result.rows.length === 0) {
        throw new ApiError(404, "User not found");
    }
    return result.rows[0];
};

module.exports = { register, login, getProfile, updateProfile, googleLogin };

/**
 * Google OAuth Login — verify id_token, find or create user
 */
async function googleLogin(idToken) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        throw new ApiError(401, "Invalid Google token");
    }

    const { email, name, sub: googleId } = payload;

    // Check if user exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    let user;
    if (existing.rows.length > 0) {
        user = existing.rows[0];
    } else {
        // Create new user (default: customer, random password since they use Google)
        const randomHash = await bcrypt.hash(googleId + Date.now(), SALT_ROUNDS);
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role)
             VALUES ($1, $2, $3, 'customer')
             RETURNING id, email, full_name, role, created_at`,
            [email, randomHash, name || email.split('@')[0]]
        );
        user = result.rows[0];
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);
    return { user: safeUser, token, isNew: existing.rows.length === 0 };
}
