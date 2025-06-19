const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "register",
      "book_add",
      "book_edit",
      "book_delete",
      "member_add",
      "member_edit",
      "member_delete",
      "loan_create",
      "loan_return",
      "loan_extend",
      "reservation_create",
      "reservation_cancel",
      "fine_paid",
      "fine_waived",
    ],
  },
  description: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    enum: ["book", "member", "loan", "reservation", "user", "system"],
  },
  entityId: {
    type: String, // Can be MySQL ID or MongoDB ObjectId
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ action: 1, timestamp: -1 })
activityLogSchema.index({ entityType: 1, entityId: 1 })

module.exports = mongoose.model("ActivityLog", activityLogSchema)
