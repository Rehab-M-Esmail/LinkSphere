const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts); //Tested successfully
router.post('/', postController.createPost); //Tested successfully
//router.get('/post', postController.getRandomPosts);
router.get('/:id', postController.getPostById); //Tested successfully
router.put('/:id', postController.updatePost); //Tested successfully
router.delete('/:id', postController.deletePost); //Tested successfully
router.put('/:id/like', postController.likePost); //Tested successfully
router.put('/:id/unlike', postController.unlikePost); //Tested successfully
router.get('/:userId/posts', postController.getPostsByUserId); //Tested successfully
router.get('/search/keyword', postController.getPostsByKeyword); 
router.get('/search/category/:category', postController.getPostsByCategory);

module.exports = router;