const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const initializeDatabase = require('./database/init');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 改為 false，因為 Zeabur 可能沒有 HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // 自動初始化資料庫
  await initializeDatabase();
});