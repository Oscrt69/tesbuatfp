const { getConnection } = require("../config/database")

const createTables = async () => {
  const connection = getConnection()

  try {
    // Books table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE NOT NULL,
        publisher VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        publication_year YEAR NOT NULL,
        total_copies INT NOT NULL DEFAULT 1,
        available_copies INT NOT NULL DEFAULT 1,
        description TEXT,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_title (title),
        INDEX idx_author (author),
        INDEX idx_isbn (isbn),
        INDEX idx_category (category)
      )
    `)

    // Members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        join_date DATE NOT NULL,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        membership_type ENUM('student', 'teacher', 'public') DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_member_id (member_id),
        INDEX idx_email (email),
        INDEX idx_status (status)
      )
    `)

    // Loans table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS loans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        book_id INT NOT NULL,
        loan_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE NULL,
        status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
        fine_amount DECIMAL(10,2) DEFAULT 0.00,
        fine_paid BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        INDEX idx_member_id (member_id),
        INDEX idx_book_id (book_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      )
    `)

    // Reservations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        book_id INT NOT NULL,
        reservation_date DATE NOT NULL,
        status ENUM('pending', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
        expiry_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        INDEX idx_member_id (member_id),
        INDEX idx_book_id (book_id),
        INDEX idx_status (status)
      )
    `)

    // Fines table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
        INDEX idx_loan_id (loan_id),
        INDEX idx_status (status)
      )
    `)

    console.log("✅ MySQL tables created successfully")
  } catch (error) {
    console.error("❌ Error creating tables:", error)
    throw error
  }
}

module.exports = { createTables }
