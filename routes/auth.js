const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `;
    
    const result = await db.query(query, [username, hashedPassword, email]);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to register user'
      });
    }
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;