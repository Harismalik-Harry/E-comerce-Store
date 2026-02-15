/**
 * Wraps an async route handler so we don't need try/catch in every controller.
 * Usage: router.get("/", catchAsync(myController));
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
