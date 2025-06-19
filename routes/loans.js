const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { getConnection } = require("../config/database")
const { logActivity } = require("../utils/logger")

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

// Get all loans
router.get("/", async (req, res) => {
  try {
    const connection = getConnection()
    const { status, page = 1, limit = 10 } = req.query

    let query = `
      SELECT l.*, m.full_name as member_name, m.member_id, b.title as book_title, b.author
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN books b ON l.book_id = b.id
      WHERE 1=1
    `
    const params = []

    if (status) {
      query += " AND l.status = ?"
      params.push(status)
    }

    query += " ORDER BY l.created_at DESC"

    // Add pagination
    const offset = (page - 1) * limit
    query += " LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [loans] = await connection.execute(query, params)

    res.json({
      success: true,
      loans,
    })
  } catch (error) {
    console.error("Get loans error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get loans",
      error: error.message,
    })
  }
})

// Create new loan
router.post("/", async (req, res) => {
  try {
    const connection = getConnection()
    const { member_id, book_id, due_date } = req.body

    // Check if book is available
    const [bookCheck] = await connection.execute("SELECT available_copies FROM books WHERE id = ?", [book_id])

    if (bookCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    if (bookCheck[0].available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available",
      })
    }

    // Create loan
    const [result] = await connection.execute(
      `
      INSERT INTO loans (member_id, book_id, loan_date, due_date, status)
      VALUES (?, ?, CURDATE(), ?, 'active')
    `,
      [member_id, book_id, due_date],
    )

    // Update book availability
    await connection.execute("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [book_id])

    // Log activity
    await logActivity(req.session.user.id, "loan_create", `Created new loan for member ID: ${member_id}`, {
      entityType: "loan",
      entityId: result.insertId.toString(),
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      success: true,
      message: "Loan created successfully",
      loanId: result.insertId,
    })
  } catch (error) {
    console.error("Create loan error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create loan",
      error: error.message,
    })
  }
})

// Return book
router.put("/:id/return", async (req, res) => {
  try {
    const connection = getConnection()
    const loanId = req.params.id

    // Get loan details
    const [loanDetails] = await connection.execute("SELECT * FROM loans WHERE id = ? AND status = 'active'", [loanId])

    if (loanDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active loan not found",
      })
    }

    const loan = loanDetails[0]

    // Update loan status
    await connection.execute(
      `
      UPDATE loans 
      SET status = 'returned', return_date = CURDATE()
      WHERE id = ?
    `,
      [loanId],
    )

    // Update book availability
    await connection.execute("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [loan.book_id])

    // Log activity
    await logActivity(req.session.user.id, "loan_return", `Book returned for loan ID: ${loanId}`, {
      entityType: "loan",
      entityId: loanId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Book returned successfully",
    })
  } catch (error) {
    console.error("Return book error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to return book",
      error: error.message,
    })
  }
})

module.exports = router
