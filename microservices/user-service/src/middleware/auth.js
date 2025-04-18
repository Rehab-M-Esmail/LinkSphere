const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    // Check if token is blacklisted
    const blacklisted = await pool.query(
      'SELECT * FROM token_blacklist WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (blacklisted.rows.length > 0) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(500).json({ 
      error: 'Internal server error during authentication',
      details: err.message 
    });
  }
};

module.exports = authenticateToken; 