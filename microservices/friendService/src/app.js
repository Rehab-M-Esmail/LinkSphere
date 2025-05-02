const express = require('express');
const axios = require('axios');
const friendRoute = require('./routes/friendRoute');
const dotenv = require('dotenv');
const friend = require('./models/friend');
dotenv.config();
const connectToDatabase = require('./config/db');
connectToDatabase();
const buildGraphNodes = async()=> {
    try {
        //const response = await axios.get(`${process.env.USER_SERVICE_URI}/users/ids`);
        const response = await axios.get(`http://localhost:3002/users/ids`);
        const users = Array.isArray(response.data) ? response.data : response.data.ids || [];
        
        //console.log(users);
        if(!users || users.length === 0) {
            console.log('No users found');
            return;
        }
        //console.log(typeof users);
        // Create nodes for each user
        users.forEach((userId) => {
                    friend.createUserNode(userId);
                }
        );
        console.log('Nodes created successfully');
        //res.status(201).json({ message: 'Nodes created successfully' });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Graph nodes creation started");
buildGraphNodes();
app.use('/friend',friendRoute );
const PORT = process.env.P0RT_FRIEND_SERVICE|| 7474;
app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}`));