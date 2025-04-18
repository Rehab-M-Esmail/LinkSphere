const axios = require('axios');
const express = require('express');
const feed = require('microservices/postService/src/models/post.js');
const redisClient = require('../config/cache'); 

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
];

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

//This function will generate the personalized feed for the user by mixing the posts of the user's friends, users that are in the same group, and different gender
const generatePersonalizedFeed = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Check Redis cache first
        const cachedFeed = await redisClient.get(`feed:${userId}`);
        if (cachedFeed) {
            return res.status(200).json(JSON.parse(cachedFeed));
        }

        // Placeholder: simulate a feed
        const fakeFeed = [
            { id: 1, content: "Post from friend" },
            { id: 2, content: "Post from same age group" }
        ];

        // Cache the feed for 5 minutes
        await redisClient.set(`feed:${userId}`, JSON.stringify(fakeFeed), {
            EX: 60 * 5
        });

        res.status(200).json(fakeFeed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getpaginatedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.body;
        const startIndex = (page - 1) * limit; 
        const endIndex = page * limit;
        const posts = await feed.slice(startIndex, endIndex);
        res.status(200).json({
            posts,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetRandomAgeGroupPosts = async (req, res) => {
    try {
        const response = await axios.get(`${process.env.userServiceUrl}/post`, {
            params: { age: req.body.age }
        });
        if (response.status !== 200) {
            throw new Error(`Error fetching posts for ppl with the same age group`);
        } else {
            res.status(200).json(response);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetRandomFriendsPosts = async (req, res) => {
    try {
        const numberoffriends = 3;
        const FriendsIds = getRandomElements(users, numberoffriends);
        const friendsPosts = [];

        for (const friendId of FriendsIds) {
            const response = await axios.get(`${process.env.postServiceUrl}/post`, {
                params: { userIds: friendId }
            });

            if (response.status !== 200) {
                throw new Error(`Error fetching posts for friend ${friendId}`);
            } else {
                friendsPosts.push(...response.data);
            }

            res.status(200).json(friendsPosts);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function getRandomElements(arr, n) {
    const result = new Set();
    while (result.size < n && result.size < arr.length) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        result.add(arr[randomIndex]);
    }
    return Array.from(result);
}

module.exports = { generatePersonalizedFeed, getpaginatedPosts };
