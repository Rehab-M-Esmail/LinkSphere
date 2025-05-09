const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const redis = require('redis');
const prometheus = require('prom-client');

// Initialize Express app and router
const app = express();
const router = express.Router();

// Add middleware for parsing JSON
app.use(express.json());

// Create Redis client with fallback
let redisClient = null;
let redisEnabled = false;

const initializeRedis = async () => {
  try {
    // Check if Redis is enabled in environment
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('Redis is disabled in environment');
      return false;
    }

    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.log('Redis connection refused, retrying...');
          return 3000;
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.log('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.log('Redis max retries reached');
          return new Error('Max retries reached');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      redisEnabled = false;
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully');
      redisEnabled = true;
    });

    redisClient.on('ready', () => {
      console.log('Redis client is ready');
      redisEnabled = true;
    });

    redisClient.on('end', () => {
      console.log('Redis connection ended');
      redisEnabled = false;
    });

    await redisClient.connect();
    return true;
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
    redisClient = null;
    redisEnabled = false;
    return false;
  }
};

// Initialize Redis connection
initializeRedis().then(connected => {
  if (!connected) {
    console.log('Application will run without Redis caching');
  }
});

// Redis cache duration (1 hour)
const CACHE_EXPIRY = 3600;

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'link_sphere',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Constants
const SALT_ROUNDS = 10;

// Validation function
const validateUserData = ({ preferences, gender, date_of_birth }) => {
  const errors = [];
  
  // Validate gender
  const validGenders = ['male', 'female', 'other'];
  if (!validGenders.includes(gender.toLowerCase())) {
    errors.push('Gender must be one of: male, female, other');
  }

  // Validate preferences
  if (!Array.isArray(preferences)) {
    errors.push('Preferences must be an array');
  } else if (preferences.length === 0) {
    errors.push('At least one preference is required');
  }

  // Validate date of birth
  if (!date_of_birth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth format');
    } else {
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 7) {
        errors.push('User must be at least 7 years old');
      }
    }
  }

  return errors;
};

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        preferences TEXT[],
        profile_picture TEXT,
        date_of_birth DATE,
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

// Authentication middleware
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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Try to get from Redis first if available and enabled
    if (redisClient && redisEnabled) {
      try {
        const cachedProfile = await redisClient.get(`user:${userId}:profile`);
        if (cachedProfile) {
          return res.json({ user: JSON.parse(cachedProfile) });
        }
      } catch (redisErr) {
        console.error('Redis get error (non-fatal):', redisErr);
        // Continue to database query if Redis fails
      }
    }

    // Get from database
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        name, 
        gender, 
        preferences, 
        profile_picture,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        last_login, 
        is_active, 
        created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = result.rows[0];

    // Try to cache in Redis if available and enabled
    if (redisClient && redisEnabled) {
      try {
        await redisClient.setEx(
          `user:${userId}:profile`,
          CACHE_EXPIRY,
          JSON.stringify(userProfile)
        );
      } catch (redisErr) {
        console.error('Redis set error (non-fatal):', redisErr);
        // Continue even if Redis caching fails
      }
    }

    res.json({ user: userProfile });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      error: 'Error fetching profile',
      details: err.message 
    });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, name, gender, preferences, date_of_birth } = req.body;

  if (!email || !password || !name || !gender || !preferences || !date_of_birth) {
    return res.status(400).json({ error: 'Email, password, name, gender, preferences, and date of birth are required' });
  }

  try {
    const errors = validateUserData({ preferences, gender, date_of_birth });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password, name, gender, preferences, date_of_birth, last_login, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING 
         id, 
         email, 
         name, 
         gender, 
         preferences, 
         EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
         last_login, 
         is_active, 
         created_at`,
      [email, hashedPassword, name, gender, preferences, date_of_birth, new Date(), true, new Date(), new Date()]
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
    res.status(500).json({ 
      error: 'Error creating user',
      details: err.message 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        name, 
        gender, 
        preferences, 
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        last_login, 
        is_active, 
        created_at,
        password 
       FROM users 
       WHERE email = $1`, 
      [email]
    );

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

    // Remove password from response
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

// Logout route
router.post('/logout', async (req, res) => {
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
});

router.post('/google-login', async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.body.code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await pool.query(
      `SELECT 
        id, 
        email, 
        name, 
        gender, 
        preferences, 
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        profile_picture, 
        last_login, 
        is_active, 
        created_at 
       FROM users 
       WHERE email = $1`, 
      [email]
    );
    
    if (user.rows.length === 0) {
      // Create new user
      const result = await pool.query(
        `INSERT INTO users (email, name, profile_picture, last_login, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING 
           id, 
           email, 
           name, 
           gender, 
           preferences, 
           EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
           profile_picture, 
           last_login, 
           is_active, 
           created_at`,
        [email, name, picture, new Date(), true, new Date(), new Date()]
      );
      user = result;
    } else {
      // Update last login
      await pool.query(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [new Date(), user.rows[0].id]
      );
    }

    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: user.rows[0],
      token
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Error during Google login' });
  }
});

// Get profiles by age
router.get('/profiles/age/:age', authenticateToken, async (req, res) => {
  try {
    const { age } = req.params;
    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        email, 
        gender, 
        preferences, 
        profile_picture,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age
       FROM users 
       WHERE EXTRACT(YEAR FROM AGE(date_of_birth)) = $1 
       AND id != $2`,
      [age, req.user.id]
    );
    res.json({ profiles: result.rows });
  } catch (err) {
    console.error('Error fetching profiles by age:', err);
    res.status(500).json({ error: 'Error fetching profiles' });
  }
});

// Get profiles by gender
router.get('/profiles/gender/:gender', authenticateToken, async (req, res) => {
  try {
    const { gender } = req.params;
    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        email, 
        gender, 
        preferences, 
        profile_picture,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age
       FROM users 
       WHERE gender = $1 
       AND id != $2`,
      [gender, req.user.id]
    );
    res.json({ profiles: result.rows });
  } catch (err) {
    console.error('Error fetching profiles by gender:', err);
    res.status(500).json({ error: 'Error fetching profiles' });
  }
});

// Search users endpoint
router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query parameter is required' });
  }

  try {
    // Search for users by name or email (case insensitive)
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        name, 
        gender, 
        preferences, 
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        profile_picture, 
        is_active, 
        created_at 
      FROM users 
      WHERE 
        LOWER(name) LIKE LOWER($1) OR 
        LOWER(email) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 20`,
      [`%${query}%`]
    );
    
    const response = {
      count: result.rows.length,
      users: result.rows
    };
    
    res.json(response);
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Error searching users' });
  }
});

// Add Prometheus for metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);

// Add metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/auth', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
