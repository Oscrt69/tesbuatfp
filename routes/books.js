const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { getAllBooks, createBook } = require("../controllers/bookController")

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

router.get("/", getAllBooks)
router.post("/", createBook)

module.exports = router
