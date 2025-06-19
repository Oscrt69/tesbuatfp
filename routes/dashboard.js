const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { getConnection } = require("../config/database")
const { getRecentActivities } = require("../utils/logger")

const router = express.Router()

// Get dashboard statistics
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const connection = getConnection()

    // Get total books
    const [booksResult] = await connection.execute("SELECT COUNT(*) as count FROM books")
    const totalBooks = booksResult[0].count

    // Get total members
    const [membersResult] = await connection.execute('SELECT COUNT(*) as count FROM members WHERE status = "active"')
    const totalMembers = membersResult[0].count

    // Get borrowed books
    const [borrowedResult] = await connection.execute('SELECT COUNT(*) as count FROM loans WHERE status = "active"')
    const borrowedBooks = borrowedResult[0].count

    // Get overdue books
    const [overdueResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM loans WHERE status = "overdue" OR (status = "active" AND due_date < CURDATE())',
    )
    const overdueBooks = overdueResult[0].count

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalMembers,
        borrowedBooks,
        overdueBooks,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
      error: error.message,
    })
  }
})

// Get recent activities
router.get("/activities", requireAuth, async (req, res) => {
  try {
    const activities = await getRecentActivities(10)

    res.json({
      success: true,
      activities,
    })
  } catch (error) {
    console.error("Dashboard activities error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get recent activities",
      error: error.message,
    })
  }
})

module.exports = router
