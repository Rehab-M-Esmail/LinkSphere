const express = require('express');
const router = express.Router();
const createProxy = require('../utils/proxyService');
const verifyToken = require('../middlewares/verifyToken');

// Unprotected route
router.use('/auth', createProxy(process.env.AUTH_SERVICE_URL));

// Protected routes
router.use('/users', verifyToken, createProxy(process.env.USER_SERVICE_URL));
router.use('/posts', verifyToken, createProxy(process.env.POST_SERVICE_URL));
router.use('/events', verifyToken, createProxy(process.env.EVENT_SERVICE_URL));
router.use('/notifications', verifyToken, createProxy(process.env.NOTIFICATION_SERVICE_URL));

module.exports = router;
