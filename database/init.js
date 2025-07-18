const db = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // 建立 users 表
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 建立 reservations 表
    await db.query(`
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
      )
    `);
    
    // 建立索引
    await db.query(`CREATE INDEX IF NOT EXISTS idx_reservation_date ON reservations(reservation_date)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservations(status)`);
    
    // 檢查是否已有管理員帳號
    const adminCheck = await db.query("SELECT id FROM users WHERE username = 'admin'");
    
    if (adminCheck.rows.length === 0) {
      // 建立預設管理員帳號
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin@restaurant.com']
      );
      console.log('Default admin account created (username: admin, password: admin123)');
    }
    
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Database initialization error:', error);
    // 不要讓錯誤阻止應用程式啟動
  }
}

module.exports = initializeDatabase;