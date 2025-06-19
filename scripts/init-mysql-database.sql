-- Create database
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- Books table
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
);

-- Members table
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
);

-- Loans table
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
);

-- Reservations table
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
);

-- Fines table
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
);

-- Insert sample data
INSERT INTO books (title, author, isbn, publisher, category, publication_year, total_copies, available_copies, description) VALUES
('Pemrograman Web Modern', 'John Doe', '978-0123456789', 'Tech Publisher', 'Teknologi', 2023, 5, 4, 'Panduan lengkap pemrograman web modern'),
('Algoritma dan Struktur Data', 'Jane Smith', '978-0987654321', 'CS Books', 'Teknologi', 2022, 3, 2, 'Konsep dasar algoritma dan struktur data'),
('Sejarah Indonesia', 'Ahmad Soekarno', '978-0111222333', 'Sejarah Press', 'Sejarah', 2021, 4, 4, 'Sejarah lengkap Indonesia dari masa ke masa'),
('Fisika Dasar', 'Dr. Einstein', '978-0444555666', 'Science Books', 'Sains', 2023, 6, 5, 'Konsep dasar fisika untuk pemula');

INSERT INTO members (member_id, full_name, email, phone, address, join_date, membership_type) VALUES
('M001', 'Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 1', '2023-01-15', 'public'),
('M002', 'Siti Nurhaliza', 'siti@email.com', '081234567891', 'Jl. Sudirman No. 2', '2023-02-20', 'student'),
('M003', 'Ahmad Rahman', 'ahmad@email.com', '081234567892', 'Jl. Thamrin No. 3', '2023-03-10', 'teacher');

INSERT INTO loans (member_id, book_id, loan_date, due_date, status) VALUES
(1, 1, '2024-01-01', '2024-01-15', 'active'),
(2, 2, '2024-01-05', '2024-01-19', 'active'),
(1, 4, '2023-12-20', '2024-01-03', 'overdue');
