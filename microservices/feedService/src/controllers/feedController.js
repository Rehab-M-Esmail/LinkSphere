const axios = require('axios');
const express = require('express');
const feed = require('microservices/postService/src/models/post.js');
//const Users = require('microservices/UserController/');
//const Friends = require('microservices/friendService/');
const users =
[
    {   
        id:"1",
        user_name:"John Doe",
        gender:"M",
        age:25,
        location:"New York",
        interests:["sports", "music"],
        friends:["2", "3"],
        posts:["1", "2"],
    }
]
/*
Algorithm for Generating Personalized Feed:
1. Fetch the user's preferences from the database.
2. Get users that are in the same group as the user.
3. Get posts from other users that are not in its gender.
4. Get their friends and their posts.
2. Retrieve posts based on the above.
3. Sort the posts based on relevance and recency.
4. Paginate the posts to ensure efficient loading.
5. Return the paginated posts to the client.
6. Implement caching for frequently accessed posts to improve performance.
 */
const generatePersonalizedFeed = async (req, res) => {
}
const getpaginatedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.body;
        const startIndex= (page - 1) * limit; // pages are 1-indexed but MongoDB is 0-indexed
        const endIndex = page * limit;
        //Feed here will be replaced by the mix of posts from the user and its friends
        const posts = await feed.slice(startIndex, endIndex);
        //const count = await feed.countDocuments();
        res.status(200).json({
            posts,
            //totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const GetRandomFriendsPosts = async (req, res) => {
    try
{
    const FriendsIds =  getRandomElements(users, numberoffriends);
    //assuming that Id is the index of the user
    const numberoffriends = 3;
    const friendsPosts = [];
    for (const friendId of FriendsIds) {
            const response = await axios.get(`${process.env.postServiceUrl}/post`, {
        params: { userIds:friendId }
    });
        if (response.status !== 200) {
            // I think this should be replaced with no action cuz it's not that
            throw new Error(`Error fetching posts for friend ${friend.id}`);
        }
        else
        {
            friendsPosts.push(...response.data);
        }
        res.status(200).json(friendsPosts);
    }
    
}
catch (error) {
    res.status(500).json({ message: error.message });
}
}

function getRandomElements(arr, n) {
    const result = new Set();
    while (result.size < n && result.size < arr.length) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        result.add(arr[randomIndex]);
    }
    return Array.from(result);
}
//Since the friends service is not implemented yet, I will get random people to be act like their friends
module.exports ={generatePersonalizedFeed,getpaginatedPosts};