const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
require("dotenv").config()

// const { connectMongoDB } = require("./config/mongodb")
const { connectMySQL } = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const bookRoutes = require("./routes/books")
const memberRoutes = require("./routes/members")
const loanRoutes = require("./routes/loans")
const dashboardRoutes = require("./routes/dashboard")

const app = express()
const PORT = process.env.PORT || 3000

// Connect to databases
// connectMongoDB()
connectMySQL()

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      },
    },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
})

// Middleware
app.use(compression())
app.use(morgan("combined"))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/library_sessions",
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// View engine setup
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Static files
app.use(express.static(path.join(__dirname, "public")))
app.use("/frontend", express.static(path.join(__dirname, "../frontend")))

// Routes
app.use("/api/auth", authLimiter, authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/members", memberRoutes)
app.use("/api/loans", loanRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Root route - redirect to login
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard")
  } else {
    res.redirect("/login")
  }
})

// Auth pages
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard")
  }
  res.render("auth/login", { error: null })
})

app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard")
  }
  res.render("auth/register", { error: null })
})

// Dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  res.render("dashboard/index", { user: req.session.user })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend: http://localhost:${PORT}/dashboard`)
  console.log(`🔐 Login: http://localhost:${PORT}/login`)
})

module.exports = app
