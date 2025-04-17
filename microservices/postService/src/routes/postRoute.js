const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/post', postController.getAllPosts);
router.post('/post/add', postController.createPost);
router.get('/post/random', postController.getRandomPosts);
router.get('/post/:id', postController.getPostById);
router.put('/post/:id', postController.updatePost);
router.delete('/post/:id', postController.deletePost);
router.post('/post/:id/like', postController.likePost);
router.post('/post/:id/unlike', postController.unlikePost);
router.get('/post/:userId', postController.getPostsByUserId);
router.get('/feed/:keyword', postController.getPostsByKeyword);


module.exports = router;