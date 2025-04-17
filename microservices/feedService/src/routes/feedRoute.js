const express = require('express');
const router = express.Router();
const postController = require('../controllers/feedController');

router.get('/feed/:user_id', postController.generatePersonalizedFeed);