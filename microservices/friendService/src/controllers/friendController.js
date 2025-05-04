const friend = require('../models/friend'); //This line will be changed to represent all types of relationships
/*
Algorithm 
1. Get all users IDs from the database and store them in a file
   - Use the user service to get all users
2. Create node for each user
3. Create edges between the users
*/
const getFriends = async(req,res)=>
{
    const userId = req.params.user_id;
    //console.log(userId);
    try {
        const user1 = await friend.getUserById(userId);
        console.log(user1);
            if (!user1) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        const friends = await friend.getFriends(userId);
        res.status(200).json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//This will be modified to have a switch case to add all types of relationships
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
//To be implemented later msh fadya ll high expectations bt3ty


/* const addsibling = async (req, res) => {
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
        await friend.addSibling(userId1, userId2);
        res.status(201).json({ message: 'Sibling relationship created successfully' });
    } catch (error) {
        console.error('Error adding sibling:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const removeSibling = async (req, res) => {
    const { userId1, userId2 } = req.body;
    try {
        const [user1, user2] = await Promise.all([
            friend.getUserById(userId1),
            friend.getUserById(userId2)
        ]);
        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        await friend.removeSibling(userId1, userId2);
        res.status(200).json({ message: 'Sibling relationship removed successfully' });
    } catch (error) {
        console.error('Error removing sibling:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const getSiblings = async (req, res) => {
    const userId = req.params.user_id;
    try {
        const siblings = await friend.getSiblings(userId);
        res.status(200).json(siblings);
    } catch (error) {
        console.error('Error fetching siblings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const addMarriageRelationship = async (req, res) => {
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
        await friend.addMarriageRelationship(userId1, userId2);
        res.status(201).json({ message: 'Marriage relationship created successfully' });
    } catch (error) {
        console.error('Error adding marriage relationship:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const removeMarriageRelationship = async (req, res) => {
    const { userId1, userId2 } = req.body;
    try {
        const [user1, user2] = await Promise.all([
            friend.getUserById(userId1),
            friend.getUserById(userId2)
        ]);
        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }
        await friend.removeMarriageRelationship(userId1, userId2);
        res.status(200).json({ message: 'Marriage relationship removed successfully' });
    } catch (error) {
        console.error('Error removing marriage relationship:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
 */
const getRecommendations = async (req, res) => {
}
const getFriendById = async (req, res) => { }
module.exports = {
    getFriends,
    addFriend,
    removeFriend,
    getFriendById,
    getRecommendations,
}