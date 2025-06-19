const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  ipAddress: String,
  userAgent: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
})

// Auto-remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("Session", sessionSchema)
