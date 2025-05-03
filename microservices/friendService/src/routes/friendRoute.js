const express = require('express');
const router = express.Router();
const { getFriends, addFriend, removeFriend,getRecommendations } = require('../controllers/friendController');
router.get('/:user_id',getFriends);
router.post('/',addFriend); //Tested successfully
router.delete('/',removeFriend); //Tested successfully
router.get('/:userId/recommendations', getRecommendations);
module.exports = router;