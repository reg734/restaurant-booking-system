document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const filterBtn = document.getElementById('filterBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    checkAuthStatus();
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('token', result.token);
                showAdminPanel(result.user.username);
            } else {
                showLoginMessage(result.error || '登入失敗', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showLoginMessage('系統錯誤，請稍後再試', 'error');
        }
    });
    
    logoutBtn.addEventListener('click', async function() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            });
            localStorage.removeItem('token');
            showLoginSection();
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
    
    filterBtn.addEventListener('click', loadReservations);
    refreshBtn.addEventListener('click', () => {
        document.getElementById('filterDate').value = '';
        document.getElementById('filterStatus').value = '';
        loadReservations();
        loadDashboardStats();
    });
    
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            if (data.authenticated) {
                showAdminPanel(data.user.username);
            } else {
                showLoginSection();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            showLoginSection();
        }
    }
    
    function showLoginSection() {
        loginSection.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
    
    function showAdminPanel(username) {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        document.getElementById('welcomeUser').textContent = `歡迎, ${username}`;
        loadReservations();
        loadDashboardStats();
    }
    
    function showLoginMessage(text, type) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        setTimeout(() => {
            messageDiv.className = 'message';
        }, 3000);
    }
    
    async function loadReservations() {
        const date = document.getElementById('filterDate').value;
        const status = document.getElementById('filterStatus').value;
        
        let url = '/api/admin/reservations?';
        if (date) url += `date=${date}&`;
        if (status) url += `status=${status}&`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                displayReservations(data.reservations);
            }
        } catch (error) {
            console.error('Load reservations error:', error);
        }
    }
    
    async function loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/dashboard-stats');
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('todayConfirmed').textContent = data.stats.today.confirmed || 0;
                document.getElementById('todayPending').textContent = data.stats.today.pending || 0;
                document.getElementById('todayCancelled').textContent = data.stats.today.cancelled || 0;
                document.getElementById('monthTotal').textContent = data.stats.month.total || 0;
                document.getElementById('monthGuests').textContent = data.stats.month.total_guests || 0;
            }
        } catch (error) {
            console.error('Load stats error:', error);
        }
    }
    
    function displayReservations(reservations) {
        const tbody = document.getElementById('reservationsList');
        tbody.innerHTML = '';
        
        reservations.forEach(reservation => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${reservation.id}</td>
                <td>${reservation.customer_name}</td>
                <td>${reservation.customer_phone}</td>
                <td>${new Date(reservation.reservation_date).toLocaleDateString('zh-TW')}</td>
                <td>${reservation.reservation_time}</td>
                <td>${reservation.party_size}</td>
                <td><span class="status-badge status-${reservation.status}">${getStatusText(reservation.status)}</span></td>
                <td>${reservation.special_requests || '-'}</td>
                <td>
                    <div class="action-buttons">
                        ${reservation.status === 'pending' ? 
                            `<button class="action-btn confirm-btn" onclick="updateReservationStatus(${reservation.id}, 'confirmed')">確認</button>` : ''
                        }
                        ${reservation.status !== 'cancelled' ? 
                            `<button class="action-btn cancel-btn" onclick="updateReservationStatus(${reservation.id}, 'cancelled')">取消</button>` : ''
                        }
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    function getStatusText(status) {
        const statusMap = {
            'pending': '待確認',
            'confirmed': '已確認',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }
    
    window.updateReservationStatus = async function(id, status) {
        try {
            const response = await fetch(`/api/admin/reservations/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadReservations();
                loadDashboardStats();
            }
        } catch (error) {
            console.error('Update status error:', error);
        }
    };
});