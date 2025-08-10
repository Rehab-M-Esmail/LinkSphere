const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");

// User routes
router.get("/profile", authenticateToken, UserController.getProfile);
router.get(
  "/profiles/age/:age",
  authenticateToken,
  UserController.getProfilesByAge
);
router.get(
  "/profiles/gender/:gender",
  authenticateToken,
  UserController.getProfilesByGender
);
router.get("/ids", UserController.getIds);
router.post("/forget-password", UserController.forgetPassword);
router.post("/reset-password", UserController.resetPassword);
module.exports = router;
