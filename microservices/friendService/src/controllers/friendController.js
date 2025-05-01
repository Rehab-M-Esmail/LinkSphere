const axios = require('axios');
const friend = require('../models/friend');
/*
Algorithm 
1. Get all users IDs from the database and store them in a file
   - Use the user service to get all users
2. Create node for each user
3. Create edges between the users
*/
const buildGraphNodes = async () => {
    try {
        const response = await axios.get('http://localhost:3002/users/ids');
        const users = response.data;
        //console.log(users);
        // Create nodes for each user
        users.forEach(user => {
                    friend.createUserNode(user.id);
                }
        );
        console.log('Nodes created successfully');
        res.status(201).json({ message: 'Nodes created successfully' });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
const getFriends = async(req,res)=>
{
    const userId = req.params.user_id;
    try {
        const friends = await friend.getFriends(userId);
        res.status(200).json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const addFriend = async (req, res) => {
    const { userId1, userId2 } = req.body;
    try {
        // Check if both users exist in the database 
        const [user1, user2] = await Promise.all([
            friend.getUserById(userId1),
            friend.getUserById(userId2)
        ]);
        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        await friend.addFriendship(userId1, userId2);
        res.status(201).json({ message: 'Friendship created successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const removeFriend = async (req, res) => {
        const { userId1, userId2 } = req.body;
try {
            const [user1, user2] = await Promise.all([
            friend.getUserById(userId1),
            friend.getUserById(userId2)
        ]);
        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        await friend.removeFriendship(userId1, userId2);
        res.status(200).json({ message: 'Friendship removed successfully' });
    }
catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
    
}
}
const getRecommendations = async (req, res) => {
}
const getFriendById = async (req, res) => { }
module.exports = {
    getFriends,
    addFriend,
    removeFriend,
    getFriendById,
    getRecommendations,
    buildGraphNodes
}