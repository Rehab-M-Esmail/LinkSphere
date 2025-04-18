const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const pool = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

class AuthController {
  static async register(req, res) {
    const { email, password, name, gender, preferences, date_of_birth } = req.body;

    if (!email || !password || !name || !gender || !preferences || !date_of_birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        name,
        gender,
        preferences,
        date_of_birth
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user,
        token
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        error: 'Error creating user',
        details: err.message 
      });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await User.validatePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await User.updateLastLogin(user.id);

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      delete user.password;

      res.json({
        user,
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        error: 'Error during login',
        details: err.message 
      });
    }
  }

  static async logout(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      await pool.query(
        'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)',
        [token, new Date(decoded.exp * 1000)]
      );

      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expired' });
      }
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Error during logout' });
    }
  }

  static async googleLogin(req, res) {
    try {
      const { tokens } = await oauth2Client.getToken(req.body.code);
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      let user = await User.findByEmail(email);
      
      if (!user) {
        // Create new user
        user = await User.create({
          email,
          password: Math.random().toString(36).slice(-8), // Generate random password
          name,
          gender: 'other', // Default gender
          preferences: [],
          date_of_birth: new Date().toISOString().split('T')[0], // Default to today
          profile_picture: picture
        });
      } else {
        // Update last login
        await User.updateLastLogin(user.id);
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      delete user.password;

      res.json({
        user,
        token
      });
    } catch (err) {
      console.error('Google login error:', err);
      res.status(500).json({ error: 'Error during Google login' });
    }
  }
}

module.exports = AuthController; 