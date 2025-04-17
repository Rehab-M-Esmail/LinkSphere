const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);
//router.get('/post', postController.getRandomPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.put('/:id/like', postController.likePost);
router.put('/:id/unlike', postController.unlikePost);
router.get('/:userId/posts', postController.getPostsByUserId);
//router.get('/feed/:keyword', postController.getPostsByKeyword);


module.exports = router;