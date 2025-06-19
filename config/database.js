const mysql = require("mysql2/promise")

let pool

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "library_management",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    })

    // Test connection
    const connection = await pool.getConnection()
    console.log("✅ MySQL Connected successfully")
    connection.release()
  } catch (error) {
    console.error("❌ MySQL connection error:", error)
    process.exit(1)
  }
}

const getConnection = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call connectMySQL first.")
  }
  return pool
}

module.exports = { connectMySQL, getConnection }
