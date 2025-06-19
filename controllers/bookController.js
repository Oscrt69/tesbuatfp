const { getConnection } = require("../config/database")
const { logActivity } = require("../utils/logger")

const getAllBooks = async (req, res) => {
  try {
    const connection = getConnection()
    const { search, category, year, page = 1, limit = 10 } = req.query

    let query = "SELECT * FROM books WHERE 1=1"
    const params = []

    if (search) {
      query += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (category) {
      query += " AND category = ?"
      params.push(category)
    }

    if (year) {
      query += " AND publication_year = ?"
      params.push(year)
    }

    query += " ORDER BY created_at DESC"

    // Add pagination
    const offset = (page - 1) * limit
    query += " LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [books] = await connection.execute(query, params)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM books WHERE 1=1"
    const countParams = []

    if (search) {
      countQuery += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)"
      const searchTerm = `%${search}%`
      countParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (category) {
      countQuery += " AND category = ?"
      countParams.push(category)
    }

    if (year) {
      countQuery += " AND publication_year = ?"
      countParams.push(year)
    }

    const [countResult] = await connection.execute(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      success: true,
      books,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get books error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get books",
      error: error.message,
    })
  }
}

const createBook = async (req, res) => {
  try {
    const connection = getConnection()
    const { title, author, isbn, publisher, category, publication_year, total_copies, description, location } = req.body

    const query = `
      INSERT INTO books (title, author, isbn, publisher, category, publication_year, total_copies, available_copies, description, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await connection.execute(query, [
      title,
      author,
      isbn,
      publisher,
      category,
      publication_year,
      total_copies,
      total_copies,
      description,
      location,
    ])

    // Log activity
    await logActivity(req.session.user.id, "book_add", `Added new book: ${title}`, {
      entityType: "book",
      entityId: result.insertId.toString(),
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      bookId: result.insertId,
    })
  } catch (error) {
    console.error("Create book error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    })
  }
}

module.exports = {
  getAllBooks,
  createBook,
}
