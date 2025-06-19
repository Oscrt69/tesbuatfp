<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - LMS7</title>
    <link rel="stylesheet" href="/frontend/css/styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .user-info {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(45, 45, 45, 0.95);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 107, 53, 0.1);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-info .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .user-info .user-details {
            color: #e0e0e0;
        }
        
        .user-info .user-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .user-info .user-role {
            font-size: 0.85rem;
            color: #ff6b35;
            text-transform: capitalize;
        }
        
        .logout-btn {
            background: rgba(220, 53, 69, 0.2);
            border: 1px solid rgba(220, 53, 69, 0.3);
            color: #ff6b6b;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: rgba(220, 53, 69, 0.3);
        }
        
        @media (max-width: 768px) {
            .user-info {
                position: relative;
                top: auto;
                right: auto;
                margin: 1rem;
                justify-content: space-between;
            }
        }
    </style>
</head>
<body>
    <!-- User Info -->
    <div class="user-info">
        <div class="user-avatar">
            <%= user.fullName.charAt(0).toUpperCase() %>
        </div>
        <div class="user-details">
            <div class="user-name"><%= user.fullName %></div>
            <div class="user-role"><%= user.role %></div>
        </div>
        <button class="logout-btn" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Keluar
        </button>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="nav-brand">
                <i class="fas fa-book"></i>
                <span>LMS7</span>
            </div>
            <nav class="nav-menu" id="navMenu">
                <a href="#dashboard" class="nav-item active" data-section="dashboard">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#books" class="nav-item" data-section="books">
                    <i class="fas fa-book"></i> Koleksi Buku
                </a>
                <a href="#members" class="nav-item" data-section="members">
                    <i class="fas fa-users"></i> Anggota
                </a>
                <a href="#circulation" class="nav-item" data-section="circulation">
                    <i class="fas fa-exchange-alt"></i> Sirkulasi
                </a>
                <a href="#reservations" class="nav-item" data-section="reservations">
                    <i class="fas fa-bookmark"></i> Reservasi
                </a>
                <a href="#reports" class="nav-item" data-section="reports">
                    <i class="fas fa-chart-bar"></i> Laporan
                </a>
            </nav>
            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <!-- Include the rest of your HTML content from the original index.html -->
    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard Section -->
        <section id="dashboard" class="section active">
            <div class="container">
                <h1>Dashboard</h1>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalBooks">0</h3>
                            <p>Total Buku</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalMembers">0</h3>
                            <p>Total Anggota</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="borrowedBooks">0</h3>
                            <p>Buku Dipinjam</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="overdueBooks">0</h3>
                            <p>Terlambat</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="dashboard-content">
                    <div class="card">
                        <h2>Aktivitas Terbaru</h2>
                        <div id="recentActivities" class="activity-list">
                            <!-- Activities will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Add all other sections from your original HTML here -->
        <!-- Books Section, Members Section, etc. -->
    </main>

    <!-- Include all modals from your original HTML -->
    
    <!-- Notification -->
    <div id="notification" class="notification">
        <div class="notification-content">
            <span id="notificationMessage"></span>
            <button id="closeNotification">&times;</button>
        </div>
    </div>

    <script src="/frontend/js/script.js"></script>
    <script>
        // Enhanced script with API integration
        async function logout() {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = data.redirectUrl || '/login';
                } else {
                    alert('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed');
            }
        }

        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard/stats');
                const data = await response.json();
                
                if (data.success) {
                    // Update stats
                    document.getElementById('totalBooks').textContent = data.stats.totalBooks || 0;
                    document.getElementById('totalMembers').textContent = data.stats.totalMembers || 0;
                    document.getElementById('borrowedBooks').textContent = data.stats.borrowedBooks || 0;
                    document.getElementById('overdueBooks').textContent = data.stats.overdueBooks || 0;
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }

        // Load recent activities
        async function loadRecentActivities() {
            try {
                const response = await fetch('/api/dashboard/activities');
                const data = await response.json();
                
                if (data.success && data.activities) {
                    const container = document.getElementById('recentActivities');
                    container.innerHTML = '';
                    
                    data.activities.forEach(activity => {
                        const activityElement = document.createElement('div');
                        activityElement.className = 'activity-item';
                        activityElement.innerHTML = `
                            <div class="activity-icon success">
                                <i class="fas fa-info"></i>
                            </div>
                            <div class="activity-content">
                                <h4>${activity.description}</h4>
                                <p>Oleh: ${activity.userId?.fullName || 'System'}</p>
                            </div>
                            <div class="activity-time">${new Date(activity.timestamp).toLocaleString('id-ID')}</div>
                        `;
                        container.appendChild(activityElement);
                    });
                }
            } catch (error) {
                console.error('Failed to load activities:', error);
            }
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', () => {
            loadDashboardData();
            loadRecentActivities();
        });
    </script>
</body>
</html>
