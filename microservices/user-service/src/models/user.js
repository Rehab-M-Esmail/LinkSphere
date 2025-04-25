const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { redisClient, redisEnabled } = require('../config/redis');

const SALT_ROUNDS = 10;
const CACHE_EXPIRY = 3600; // 1 hour

class User {
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    // Try Redis cache first
    if (redisClient && redisEnabled) {
      try {
        const cachedUser = await redisClient.get(`user:${id}:profile`);
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      } catch (err) {
        console.error('Redis get error:', err);
      }
    }

    // If not in cache, get from database
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
      [id]
    );

    const user = result.rows[0];

    // Cache the result if Redis is available
    if (user && redisClient && redisEnabled) {
      try {
        await redisClient.setEx(
          `user:${id}:profile`,
          CACHE_EXPIRY,
          JSON.stringify(user)
        );
      } catch (err) {
        console.error('Redis set error:', err);
      }
    }

    return user;
  }

  static async create({ email, password, name, gender, preferences, date_of_birth }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      `INSERT INTO users (
        email, password, name, gender, preferences, date_of_birth,
        last_login, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, name, gender, preferences, 
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age,
        last_login, is_active, created_at`,
      [
        email, hashedPassword, name, gender, preferences, date_of_birth,
        new Date(), true, new Date(), new Date()
      ]
    );

    return result.rows[0];
  }

  static async updateLastLogin(userId) {
    await pool.query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date(), userId]
    );
  }

  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async getIds() {
    const result = await pool.query('SELECT id FROM users');
    return result.rows.map(user => user.id);
  }
}

module.exports = User; 