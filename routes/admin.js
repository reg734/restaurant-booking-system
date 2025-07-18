const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateSession } = require('../middleware/auth');

router.use(authenticateSession);

router.get('/reservations', async (req, res) => {
  const { date, status } = req.query;
  
  try {
    let query = `
      SELECT * FROM reservations
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (date) {
      query += ` AND reservation_date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY reservation_date DESC, reservation_time DESC';

    const result = await db.query(query, params);
    
    res.json({
      success: true,
      reservations: result.rows
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations'
    });
  }
});

router.put('/reservations/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }

  try {
    const query = `
      UPDATE reservations
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation status updated',
      reservation: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reservation'
    });
  }
});

router.get('/dashboard-stats', async (req, res) => {
  try {
    const todayQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM reservations
      WHERE reservation_date = CURRENT_DATE
    `;

    const monthQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(party_size) as total_guests
      FROM reservations
      WHERE 
        DATE_TRUNC('month', reservation_date) = DATE_TRUNC('month', CURRENT_DATE)
        AND status != 'cancelled'
    `;

    const todayResult = await db.query(todayQuery);
    const monthResult = await db.query(monthQuery);

    res.json({
      success: true,
      stats: {
        today: todayResult.rows[0],
        month: monthResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

module.exports = router;