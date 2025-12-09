const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require("../utils/validators");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerValidation), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginValidation), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/update-profile",
  authenticate,
  validate(updateProfileValidation),
  authController.updateProfile
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated (for frontend)
 * @access  Private
 */
router.get("/check", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user,
  });
});

module.exports = router;
