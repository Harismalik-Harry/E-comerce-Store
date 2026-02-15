/**
 * Custom API Error class for consistent error responses.
 * Usage: throw new ApiError(404, "Product not found");
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    }
}

module.exports = ApiError;
