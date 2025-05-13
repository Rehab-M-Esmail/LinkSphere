const axios = require("axios");
const redisClient = require("../config/cache");
const CircuitBreaker = require("opossum");
const RabbitMQConsumer = require("../../../RabbitMQ/consumer");
const axiosRequest = async (url) => {
  return axios.get(url);
};

const breaker = new CircuitBreaker(axiosRequest, {
  timeout: 5000, // Timeout for requests (5 seconds)
  errorThresholdPercentage: 50, // Trip the circuit if 50% of requests fail
  resetTimeout: 10000, // Wait 10 seconds before trying again
});
breaker.fallback(() => {
  console.log("Circuit breaker fallback triggered");
  return []; // Return an empty array as a fallback
});
breaker.on("success", () => {
  console.log(`Circuit breaker success touching this request ${axiosRequest}`);
});
breaker.on("failure", () => {
  console.log("Circuit breaker failure");
});
breaker.on("timeout", () => {
  console.log("Circuit breaker timeout");
});
breaker.on("open", () => {
  console.log("Circuit breaker open");
});
breaker.on("close", () => {
  console.log("Circuit breaker closed");
});
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
// Will be modified to add function to get random public posts
//This function will generate the personalized feed for the user by mixing the posts of the user's friends, users that are in the same group, and different gender

const getpaginatedPosts = async (req, res) => {
  try {
    //console.log(req.params.user_id);
    var { page = 1, limit = 10 } = req.body;
    const startIndex = (page - 1) * limit; // pages are 1-indexed but MongoDB is 0-indexed
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
    res
      .status(500)
      .json(`Error from getpaginatedPosts function ${error.message}`);
  }
};
const generatePersonalizedFeed = async (req) => {
  const cacheKey = `personalizedFeed:${req.params.user_id}`;
  const cachedFeed = await redisClient.get(cacheKey);
  if (cachedFeed) {
    console.log("Cache hit for personalized feed");
    return JSON.parse(cachedFeed);
  }
  console.log("Cache miss for personalized feed");
  const ageGroupPosts = await GetRandomAgeGroupPosts(req);
  //console.log('Generated Age Group Posts:', ageGroupPosts);

  const friendsPosts = await GetFriendsPosts(req);
  //console.log('Generated Friends Posts:', friendsPosts);

  const mixedPosts = [...ageGroupPosts, ...friendsPosts];

  // console.log('Mixed Posts:', mixedPosts);

  // Sort the posts based on recency
  mixedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  await redisClient.set(cacheKey, JSON.stringify(mixedPosts), {
    EX: 3600,
  });

  return mixedPosts;
};
//working as expected
const GetConsumedPosts = async (friendList) => {
  try {
    const messages = await RabbitMQConsumer.setup("post-events");
    // Filter messages to include only those from the user's friends
    const friendPosts = messages.filter((message) =>
      friendList.includes(message.userId)
    );
    console.log(friendPosts);
    return friendPosts;
  } catch (error) {
    console.log("Error in GetConsumedPosts:", error.message);
    return [];
  }
};
//This function will get the posts of the users that are in the same group as the user
// => function will be modified to allow passing age group as a parameter not just the age
const GetRandomAgeGroupPosts = async (req) => {
  try {
    const cacheKey = `ageGroupPosts:${req.body.age}`;
    const cachedPosts = await redisClient.get(cacheKey);
    if (cachedPosts) {
      console.log("Cache hit for age group posts");
      return JSON.parse(cachedPosts);
    }
    console.log("Cache miss for age group posts");
    const response = await breaker.fire(
      `${process.env.postServiceUrl}/post/${req.body.age}`
    );
    if (response.status !== 200) {
      // I think this should be replaced with no action cuz it's not that important
      //throw new Error(`Error fetching posts for ppl with the same age group`);
      console.log(`Error fetching posts for age group ${req.body.age}`);
      return [];
    }
    await redisClient.set(cacheKey, JSON.stringify(response.data), {
      EX: 3600,
    });
    return response.data; //this will return the whole post's data
    //return response.data.map(post => post.content); returns only the content of the post
  } catch (error) {
    console.log(` MESSAGE FROM AGE ${error.message}`);
    return [];
  }
};
//This function will get the posts of the friends of the user
const GetFriendsPosts = async (req) => {
  const cacheKey = `friendsPosts:${req.params.user_id}`;
  const cachedPosts = await redisClient.get(cacheKey);
  if (cachedPosts) {
    console.log("Cache hit for friends posts");
    return JSON.parse(cachedPosts); // Return the cached posts
  }
  console.log("Cache miss for friends posts");
  try {
    const FriendsIds = await breaker.fire(
      `http://localhost:7474/friend/${req.params.user_id}`
    );
    const friendsArray = FriendsIds.data?.friends || [];
    if (!Array.isArray(FriendsIds)) {
      console.log("FriendsIds is not an array:", FriendsIds);
      return [];
    }
    const consumed = await GetConsumedPosts(FriendsIds);
    //assuming that Id is the index of the user
    const friendsPosts = [];
    for (const friendId of friendsArray) {
      const response = await breaker.fire(
        `${process.env.postServiceUrl}/post/${friendId}/posts`
      );
      if (response.status == 200) {
        friendsPosts.push(...response.data);
      } else {
        // I think this should be replaced with no action cuz it's not that important
        //throw new Error(`Error fetching posts for friend ${friendId}`);
      }
    }
    await redisClient.set(cacheKey, JSON.stringify(friendsPosts), {
      EX: 3600,
    });
    console.log("Personalized feed cached successfully for key:", cacheKey);
    return [...friendsPosts, ...consumed];
    //return friendsPosts.map(post => post.content);
  } catch (error) {
    console.log("Error from GetFriendsPosts ", {
      message: error.message,
    });
    return [];
  }
};

//Since the friends service is not implemented yet, I will get random people to be act like their friends
module.exports = { getpaginatedPosts };
