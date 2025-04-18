const express = require('express');
const router = express.Router();
const postController = require('../controllers/feedController');

router.get('/:user_id', postController.getpaginatedPosts);
module.exports = router;