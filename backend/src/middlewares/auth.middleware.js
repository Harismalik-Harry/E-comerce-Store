const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }
};

/**
 * Middleware: Restrict access to specific roles
 * Usage: authorize("seller", "admin")
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }
        next();
    };
};

module.exports = { authenticate, authorize };
