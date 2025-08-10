const pool = require("../config/database");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const { redisClient, redisEnabled } = require("../config/redis");

const SALT_ROUNDS = 10;
const CACHE_EXPIRY = 3600; // 1 hour

class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
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
        console.error("Redis get error:", err);
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
        console.error("Redis set error:", err);
      }
    }

    return user;
  }

  static async create({
    email,
    password,
    name,
    gender,
    preferences,
    date_of_birth,
  }) {
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
        email,
        hashedPassword,
        name,
        gender,
        preferences,
        date_of_birth,
        new Date(),
        true,
        new Date(),
        new Date(),
      ]
    );

    return result.rows[0];
  }

  static async updateLastLogin(userId) {
    await pool.query("UPDATE users SET last_login = $1 WHERE id = $2", [
      new Date(),
      userId,
    ]);
  }

  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async getIds() {
    const result = await pool.query("SELECT id FROM users");
    //console.log("in user file",result.rows);
    return result.rows.map((row) => row.id);
  }
  static async forgetPassword(email) {
    // Generate a reset code
    if (!email) {
      throw new Error("Email is required for password reset.");
    }
    // Here you would typically send the reset code to the user's email
    // For demonstration, we will just return the reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your email provider
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset Code",
      text: `Your password reset code is: ${code}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Reset code sent to ${email}: ${resetCode}`);
  }
  static async ResetPassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    console.log(`Password reset for ${email}`);
  }
}

module.exports = User;
