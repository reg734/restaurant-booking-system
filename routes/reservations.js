const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/create', async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    reservation_date,
    reservation_time,
    party_size,
    special_requests
  } = req.body;

  try {
    const query = `
      INSERT INTO reservations 
      (customer_name, customer_phone, customer_email, reservation_date, reservation_time, party_size, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      customer_name,
      customer_phone,
      customer_email,
      reservation_date,
      reservation_time,
      party_size,
      special_requests
    ];

    const result = await db.query(query, values);
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reservation'
    });
  }
});

router.get('/check-availability', async (req, res) => {
  const { date, time } = req.query;

  try {
    const query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE reservation_date = $1
      AND reservation_time = $2
      AND status != 'cancelled'
    `;

    const result = await db.query(query, [date, time]);
    const count = parseInt(result.rows[0].count);
    const maxCapacity = 20;

    res.json({
      available: count < maxCapacity,
      spotsLeft: maxCapacity - count
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
});

module.exports = router;