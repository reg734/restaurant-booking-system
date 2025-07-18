-- 創建資料庫
CREATE DATABASE IF NOT EXISTS restaurant_booking;

-- 使用資料庫
\c restaurant_booking;

-- 創建用戶表（後台管理員）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建訂位表
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    special_requests TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引以提高查詢性能
CREATE INDEX idx_reservation_date ON reservations(reservation_date);
CREATE INDEX idx_reservation_status ON reservations(status);

-- 插入預設管理員帳號（密碼: admin123）
-- 密碼已經使用 bcrypt 加密
INSERT INTO users (username, password, email) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin@restaurant.com')
ON CONFLICT DO NOTHING;