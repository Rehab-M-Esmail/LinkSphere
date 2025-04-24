const express = require('express');
const router = express.Router();
const { getFriends, addFriend, removeFriend,getFriendById } = require('../controllers/friendController');
router.get('/:user_id',getFriends);
router.post('/',addFriend);
router.delete('/',removeFriend);
router.get('/friends/:id',getFriendById);
module.exports = router;