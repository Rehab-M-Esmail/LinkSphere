const axios = require('axios');
const express = require('express');
//const feed = require('/Users/rehabmahmoud/UNI/Year 3/GO/LinkSphere/microservices/postService/src/post.js');
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

const getpaginatedPosts = async (req, res) => {
    try {
        var { page = 1, limit = 10 } = req.body;
        const startIndex= (page - 1) * limit; // pages are 1-indexed but MongoDB is 0-indexed
        const endIndex = page * limit;
        //Feed here will be replaced by the mix of posts from the user and its friends
        const feedPosts = await generatePersonalizedFeed(req);
        const posts = await feedPosts.slice(startIndex, endIndex);
        //const count = await feed.countDocuments();
        res.status(200).json({
            posts,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const generatePersonalizedFeed = async (req) => {
            const ageGroupPosts = await GetRandomAgeGroupPosts(req);
            const friendsPosts = await GetRandomFriendsPosts();
            const mixedPosts = [...ageGroupPosts, ...friendsPosts];
            // Sort the posts based on recency
            mixedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return mixedPosts;
}
//This function will get the posts of the users that are in the same group as the user
const GetRandomAgeGroupPosts = async (req, res) => {
    try {
        const response = await axios.get(`${process.env.postServiceUrl}/post`, {
            params: { age: req.body.age }
        });
        if (response.status !== 200) {
            // I think this should be replaced with no action cuz it's not that important
            //throw new Error(`Error fetching posts for ppl with the same age group`);
            return [];
        }
    return response.data; //this will return the whole post's data 
    //return response.data.map(post => post.content); returns only the content of the post
}
catch (error) {
    console.log(` MESSAGE FROM AGE ${ error.message }`);
    return [];
}
}
//This function will get the posts of the friends of the user
const GetRandomFriendsPosts = async (req) => {
    try
{
    const users = require('../data.json');
    if (!users || users.length === 0) {
        console.log('Error fetching users');
    }
    const numberoffriends = 3;
    const selectedFriends =  getRandomElements(users, numberoffriends);
    const FriendsIds = selectedFriends.map((friend) => friend.id);
    //assuming that Id is the index of the user
    const friendsPosts = [];
    for (const friendId of FriendsIds) {
            const response = await axios.get(`${process.env.postServiceUrl}/post/${friendId}/posts`);
        if (response.status == 200) {
            friendsPosts.push(...response.data);
        }
        else
        {
            // I think this should be replaced with no action cuz it's not that important 
            //throw new Error(`Error fetching posts for friend ${friendId}`);
        }
    }
    return friendsPosts
    //return friendsPosts.map(post => post.content);
    
}
catch (error) {
    console.log('Error from GetRandomFriendsPosts ',{ message: error.message });
    return [];
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
module.exports ={getpaginatedPosts};