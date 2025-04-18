const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/google-login', AuthController.googleLogin);

module.exports = router; 