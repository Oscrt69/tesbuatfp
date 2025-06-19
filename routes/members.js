const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { getConnection } = require("../config/database")
const { logActivity } = require("../utils/logger")

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

// Get all members
router.get("/", async (req, res) => {
  try {
    const connection = getConnection()
    const { search, status, page = 1, limit = 10 } = req.query

    let query = "SELECT * FROM members WHERE 1=1"
    const params = []

    if (search) {
      query += " AND (full_name LIKE ? OR email LIKE ? OR member_id LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (status) {
      query += " AND status = ?"
      params.push(status)
    }

    query += " ORDER BY created_at DESC"

    // Add pagination
    const offset = (page - 1) * limit
    query += " LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [members] = await connection.execute(query, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM members WHERE 1=1"
    const countParams = []

    if (search) {
      countQuery += " AND (full_name LIKE ? OR email LIKE ? OR member_id LIKE ?)"
      const searchTerm = `%${search}%`
      countParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (status) {
      countQuery += " AND status = ?"
      countParams.push(status)
    }

    const [countResult] = await connection.execute(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      success: true,
      members,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get members error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get members",
      error: error.message,
    })
  }
})

// Create new member
router.post("/", async (req, res) => {
  try {
    const connection = getConnection()
    const { full_name, email, phone, address, membership_type } = req.body

    // Generate member ID
    const [lastMember] = await connection.execute("SELECT member_id FROM members ORDER BY id DESC LIMIT 1")

    let nextNumber = 1
    if (lastMember.length > 0) {
      const lastId = lastMember[0].member_id
      const lastNumber = Number.parseInt(lastId.substring(1))
      nextNumber = lastNumber + 1
    }

    const member_id = `M${nextNumber.toString().padStart(3, "0")}`

    const query = `
      INSERT INTO members (member_id, full_name, email, phone, address, join_date, membership_type)
      VALUES (?, ?, ?, ?, ?, CURDATE(), ?)
    `

    const [result] = await connection.execute(query, [
      member_id,
      full_name,
      email,
      phone,
      address,
      membership_type || "public",
    ])

    // Log activity
    await logActivity(req.session.user.id, "member_add", `Added new member: ${full_name}`, {
      entityType: "member",
      entityId: result.insertId.toString(),
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      memberId: result.insertId,
      memberCode: member_id,
    })
  } catch (error) {
    console.error("Create member error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create member",
      error: error.message,
    })
  }
})

module.exports = router
