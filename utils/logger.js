const ActivityLog = require("../models/ActivityLog")

const logActivity = async (userId, action, description, metadata = {}) => {
  try {
    const log = new ActivityLog({
      userId,
      action,
      description,
      ...metadata,
    })

    await log.save()
    return log
  } catch (error) {
    console.error("Activity logging error:", error)
    // Don't throw error to prevent breaking main functionality
  }
}

const getRecentActivities = async (limit = 10, userId = null) => {
  try {
    const query = userId ? { userId } : {}
    const activities = await ActivityLog.find(query)
      .populate("userId", "fullName username")
      .sort({ timestamp: -1 })
      .limit(limit)

    return activities
  } catch (error) {
    console.error("Get activities error:", error)
    return []
  }
}

module.exports = {
  logActivity,
  getRecentActivities,
}
