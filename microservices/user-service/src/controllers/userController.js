const User = require("../models/user");

class UserController {
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (err) {
      console.error("Profile fetch error:", err);
      res.status(500).json({
        error: "Error fetching profile",
        details: err.message,
      });
    }
  }

  static async getProfilesByAge(req, res) {
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
      console.error("Error fetching profiles by age:", err);
      res.status(500).json({ error: "Error fetching profiles" });
    }
  }

  static async getProfilesByGender(req, res) {
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
      console.error("Error fetching profiles by gender:", err);
      res.status(500).json({
        error: "Error fetching profiles",
        details: err.message,
      });
    }
  }
  static async getIds(req, res) {
    try {
      const result = await User.getIds();
      //console.log("in user controller");
      res.json({ ids: result });
    } catch (err) {
      console.error("Error fetching user IDs:", err);
      res.status(500).json({ error: "Error fetching user IDs" });
    }
  }
  static async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      await User.forgetPassword(email);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
      console.error("Error in forget password:", err);
      res.status(500).json({ error: "Error processing password reset" });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }
      await User.resetPassword(email, resetCode, newPassword);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Error in reset password:", err);
      res.status(500).json({ error: "Error processing password reset" });
    }
  }
}
module.exports = UserController;
