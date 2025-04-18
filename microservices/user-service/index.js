const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const requiredEnvVars = [
  'DB_USER',
  'DB_HOST',
  'DB_NAME',
  'DB_PASSWORD',
  'DB_PORT',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file in the microservices/user-service directory');
  process.exit(1);
}

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        preferences TEXT[],
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);

    // Create token_blacklist table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initializeDatabase();

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to the database');
  release();
});

const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MIN_AGE = 13;
const MAX_AGE = 120;
const MAX_PREFERENCES = 5;
const SALT_ROUNDS = 10;

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const blacklisted = await pool.query(
      'SELECT * FROM token_blacklist WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (blacklisted.rows.length > 0) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

const validateUserData = (data) => {
  const errors = [];

  if (data.preferences?.length > MAX_PREFERENCES) {
    errors.push('You can select up to 5 preferences');
  }

  if (data.gender && !VALID_GENDERS.includes(data.gender)) {
    errors.push('Invalid gender selection');
  }

  return errors;
};

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, gender, preferences } = req.body;

  if (!email || !password || !name || !gender || !preferences) {
    return res.status(400).json({ error: 'Email, password, name, gender, and preferences are required' });
  }

  try {
    const errors = validateUserData({ preferences, gender });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password, name, gender, preferences, last_login, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, name, gender, preferences, last_login, is_active, created_at`,
      [email, hashedPassword, name, gender, preferences, new Date(), true, new Date(), new Date()]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: result.rows[0],
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    res.status(500).json({ 
      error: 'Error creating user',
      details: err.message 
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date(), user.id]
    );

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;

    res.json({
      user,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error during login' });
  }
});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    // Verify token without checking blacklist during logout
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token to blacklist
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
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, gender, age, preferences, last_login, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  const { name, gender, age, preferences } = req.body;

  const errors = validateUserData({ preferences, age, gender });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           gender = COALESCE($2, gender),
           age = COALESCE($3, age),
           preferences = COALESCE($4, preferences),
           updated_at = $5
       WHERE id = $6
       RETURNING id, email, name, gender, age, preferences, last_login, is_active, created_at`,
      [name, gender, age, preferences, new Date(), req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

app.use('/auth', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
}); 