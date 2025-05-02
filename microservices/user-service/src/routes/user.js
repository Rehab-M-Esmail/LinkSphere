const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// User routes
router.get('/profile', authenticateToken, UserController.getProfile);
router.get('/profiles/age/:age', authenticateToken, UserController.getProfilesByAge);
router.get('/profiles/gender/:gender', authenticateToken, UserController.getProfilesByGender);
router.get('/ids', UserController.getIds);
module.exports = router; 