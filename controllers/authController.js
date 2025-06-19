const User = require("../models/User")
const ActivityLog = require("../models/ActivityLog")
const { logActivity } = require("../utils/logger")

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role: role || "librarian",
    })

    await user.save()

    // Log activity
    await logActivity(user._id, "register", `New user registered: ${fullName}`, {
      entityType: "user",
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Create session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }

    // Log activity
    await logActivity(user._id, "login", `User logged in: ${user.fullName}`, {
      entityType: "user",
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      redirectUrl: "/dashboard",
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    })
  }
}

const logout = async (req, res) => {
  try {
    if (req.session.user) {
      // Log activity
      await logActivity(req.session.user.id, "logout", `User logged out: ${req.session.user.fullName}`, {
        entityType: "user",
        entityId: req.session.user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      })

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err)
          return res.status(500).json({
            success: false,
            message: "Logout failed",
          })
        }

        res.clearCookie("connect.sid")
        res.json({
          success: true,
          message: "Logout successful",
          redirectUrl: "/login",
        })
      })
    } else {
      res.json({
        success: true,
        message: "Already logged out",
        redirectUrl: "/login",
      })
    }
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    })
  }
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
}
