const express = require("express")
const { body, validationResult } = require("express-validator")
const { register, login, logout, getProfile } = require("../controllers/authController")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

// Validation middleware
const validateRegistration = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  body("fullName").isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters").trim(),
  body("role").optional().isIn(["admin", "librarian", "staff"]).withMessage("Invalid role"),
]

const validateLogin = [
  body("username").notEmpty().withMessage("Username or email is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// Routes
router.post("/register", validateRegistration, handleValidationErrors, register)
router.post("/login", validateLogin, handleValidationErrors, login)
router.post("/logout", logout)
router.get("/profile", requireAuth, getProfile)

// Check authentication status
router.get("/check", (req, res) => {
  res.json({
    success: true,
    authenticated: !!req.session.user,
    user: req.session.user || null,
  })
})

module.exports = router
