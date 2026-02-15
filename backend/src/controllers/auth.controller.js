const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res) => {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name) {
        return res
            .status(400)
            .json({ error: "email, password, and full_name are required" });
    }

    const { user, token } = await authService.register({
        email,
        password,
        full_name,
        role,
    });

    res.status(201).json({
        message: "User registered successfully",
        user,
        token,
    });
});

/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ error: "email and password are required" });
    }

    const { user, token } = await authService.login({ email, password });

    res.json({
        message: "Login successful",
        user,
        token,
    });
});

/**
 * GET /api/auth/profile
 */
const getProfile = catchAsync(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
});

/**
 * PUT /api/auth/profile
 */
const updateProfile = catchAsync(async (req, res) => {
    const { full_name, password } = req.body;
    const user = await authService.updateProfile(req.user.id, { full_name, password });
    res.json({ message: "Profile updated successfully", user });
});

/**
 * POST /api/auth/google
 */
const googleLogin = catchAsync(async (req, res) => {
    const { token: idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: "Google token is required" });
    }
    const { user, token, isNew } = await authService.googleLogin(idToken);
    res.json({
        message: isNew ? "Account created with Google" : "Login successful",
        user,
        token,
    });
});

module.exports = { register, login, getProfile, updateProfile, googleLogin };
