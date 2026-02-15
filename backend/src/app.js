const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// ─── Global Middleware ───
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/stores", require("./routes/store.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// ─── 404 Handler ───
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
});

module.exports = app;
