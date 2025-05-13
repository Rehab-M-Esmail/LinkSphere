const request = require("supertest");
const express = require("express");
const {
  getpaginatedPosts,
} = require("../microservices/feedService/src/controllers/feedController");
const { Redis } = require("ioredis");

// Mock external modules and functions
jest.mock("axios");
jest.mock("../config/cache", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));
jest.mock("opossum");
jest.mock("../../../RabbitMQ/consumer", () => ({
  setup: jest.fn(),
}));

// Mock the express app and routes
const app = express();
app.use(express.json());
app.post("/feed/:user_id", getpaginatedPosts); //  Use a POST route to send body

// Helper function to create a mock response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Feed Controller Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: { user_id: "123" },
      body: { page: 1, limit: 10, age: 25 },
    };
    res = mockResponse();
    jest.clearAllMocks(); // Clear mock function calls before each test
  });

  describe("getpaginatedPosts", () => {
    it("should return paginated posts successfully", async () => {
      // Mock generatePersonalizedFeed to return some posts
      const mockPosts = [
        { id: 1, title: "Post 1", createdAt: "2024-07-24T12:00:00Z" },
        { id: 2, title: "Post 2", createdAt: "2024-07-23T12:00:00Z" },
      ];
      const generatePersonalizedFeed = jest.fn().mockResolvedValue(mockPosts);

      // Replace the actual function with the mock
      const routeHandler = app._router.stack.find(
        (layer) =>
          layer.route?.path === "/feed/:user_id" && layer.route?.methods.post
      ).handle;

      // Call the function directly.
      await routeHandler(req, res);

      expect(generatePersonalizedFeed).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        posts: mockPosts,
        currentPage: 1,
      });
    });

    it("should handle errors and return 500", async () => {
      // Mock generatePersonalizedFeed to throw an error
      const generatePersonalizedFeed = jest
        .fn()
        .mockRejectedValue(new Error("Failed to generate feed"));

      const routeHandler = app._router.stack.find(
        (layer) =>
          layer.route?.path === "/feed/:user_id" && layer.route?.methods.post
      ).handle;

      // Call the function directly.
      await routeHandler(req, res);

      expect(generatePersonalizedFeed).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        "Error from getpaginatedPosts function Failed to generate feed"
      );
    });
  });
});

describe("generatePersonalizedFeed", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: { user_id: "123" },
      body: { age: 25 },
    };
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("should return cached feed if available in Redis", async () => {
    // Mock Redis cache hit
    const cachedPosts = '[{"id":1,"title":"Cached Post"}]';
    Redis.prototype.get.mockResolvedValue(cachedPosts);

    // Call generatePersonalizedFeed directly
    const result = await generatePersonalizedFeed(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("personalizedFeed:123");
    expect(result).toEqual(JSON.parse(cachedPosts));
    expect(global.console.log).toHaveBeenCalledWith(
      "Cache hit for personalized feed"
    );
  });

  it("should generate and cache feed if not in Redis", async () => {
    // Mock Redis cache miss and successful post retrieval
    Redis.prototype.get.mockResolvedValue(null);
    const mockAgeGroupPosts = [
      { id: 1, title: "Age Group Post", createdAt: "2024-07-24T10:00:00Z" },
    ];
    const mockFriendsPosts = [
      { id: 2, title: "Friend Post", createdAt: "2024-07-24T11:00:00Z" },
    ];

    // Mock the functions called inside
    const GetRandomAgeGroupPosts = jest
      .fn()
      .mockResolvedValue(mockAgeGroupPosts);
    const GetFriendsPosts = jest.fn().mockResolvedValue(mockFriendsPosts);
    //mock the internal functions
    const module = require("../microservices/feedService/src/controllers/feedController");
    module.GetRandomAgeGroupPosts = GetRandomAgeGroupPosts;
    module.GetFriendsPosts = GetFriendsPosts;

    // Call generatePersonalizedFeed directly
    const result = await generatePersonalizedFeed(req);

    const expectedPosts = [...mockAgeGroupPosts, ...mockFriendsPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    expect(Redis.prototype.get).toHaveBeenCalledWith("personalizedFeed:123");
    expect(GetRandomAgeGroupPosts).toHaveBeenCalledWith(req);
    expect(GetFriendsPosts).toHaveBeenCalledWith(req);
    expect(Redis.prototype.set).toHaveBeenCalledWith(
      "personalizedFeed:123",
      JSON.stringify(expectedPosts),
      { EX: 3600 }
    );
    expect(result).toEqual(expectedPosts);
    expect(global.console.log).toHaveBeenCalledWith(
      "Cache miss for personalized feed"
    );
  });
});

describe("GetConsumedPosts", () => {
  it("should return posts from friends", async () => {
    // Mock RabbitMQConsumer.setup to return specific messages
    const mockMessages = [
      { userId: "1", content: "Post from 1" },
      { userId: "2", content: "Post from 2" },
      { userId: "3", content: "Post from 3" },
    ];
    RabbitMQConsumer.setup.mockResolvedValue(mockMessages);

    const friendList = ["1", "3"];
    const result = await GetConsumedPosts(friendList);

    expect(RabbitMQConsumer.setup).toHaveBeenCalledWith("post-events");
    expect(result).toEqual([
      { userId: "1", content: "Post from 1" },
      { userId: "3", content: "Post from 3" },
    ]);
  });

  it("should handle errors and return an empty array", async () => {
    // Mock RabbitMQConsumer.setup to throw an error
    RabbitMQConsumer.setup.mockRejectedValue(
      new Error("Failed to consume messages")
    );

    const friendList = ["1", "2"];
    const result = await GetConsumedPosts(friendList);

    expect(RabbitMQConsumer.setup).toHaveBeenCalledWith("post-events");
    expect(result).toEqual([]);
    expect(global.console.log).toHaveBeenCalledWith(
      "Error in GetConsumedPosts:",
      "Failed to consume messages"
    );
  });
});

describe("GetRandomAgeGroupPosts", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: { age: 25 } };
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("should return cached posts if available in Redis", async () => {
    // Mock Redis cache hit
    const cachedPosts = [{ id: 1, title: "Cached Post" }];
    Redis.prototype.get.mockResolvedValue(JSON.stringify(cachedPosts));

    const result = await GetRandomAgeGroupPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("ageGroupPosts:25");
    expect(result).toEqual(cachedPosts);
    expect(global.console.log).toHaveBeenCalledWith(
      "Cache hit for age group posts"
    );
  });

  it("should fetch posts from the service and cache them if not in Redis", async () => {
    // Mock Redis cache miss and successful axios request
    Redis.prototype.get.mockResolvedValue(null);
    const mockResponseData = [{ id: 1, title: "Post from Service" }];
    axios.get.mockResolvedValue({ status: 200, data: mockResponseData });

    const result = await GetRandomAgeGroupPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("ageGroupPosts:25");
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.postServiceUrl}/post/25`
    );
    expect(Redis.prototype.set).toHaveBeenCalledWith(
      "ageGroupPosts:25",
      JSON.stringify(mockResponseData),
      { EX: 3600 }
    );
    expect(result).toEqual(mockResponseData);
    expect(global.console.log).toHaveBeenCalledWith(
      "Cache miss for age group posts"
    );
  });

  it("should handle service errors and return an empty array", async () => {
    // Mock axios to return an error status
    Redis.prototype.get.mockResolvedValue(null);
    axios.get.mockResolvedValue({
      status: 500,
      data: { error: "Service Unavailable" },
    });

    const result = await GetRandomAgeGroupPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("ageGroupPosts:25");
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.postServiceUrl}/post/25`
    );
    expect(result).toEqual([]);
    expect(global.console.log).toHaveBeenCalledWith(
      "Error fetching posts for age group 25"
    );
  });

  it("should handle axios errors and return an empty array", async () => {
    // Mock axios to throw an error
    Redis.prototype.get.mockResolvedValue(null);
    axios.get.mockRejectedValue(new Error("Network Error"));

    const result = await GetRandomAgeGroupPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("ageGroupPosts:25");
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.postServiceUrl}/post/25`
    );
    expect(result).toEqual([]);
    expect(global.console.log).toHaveBeenCalledWith(
      " MESSAGE FROM AGE Network Error"
    );
  });
});

describe("GetFriendsPosts", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: { user_id: "123" } };
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("should return cached posts if available in Redis", async () => {
    // Mock Redis cache hit
    const cachedPosts = [{ id: 3, title: "Cached Friend Post" }];
    Redis.prototype.get.mockResolvedValue(JSON.stringify(cachedPosts));

    const result = await GetFriendsPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("friendsPosts:123");
    expect(result).toEqual(JSON.parse(cachedPosts));
    expect(global.console.log).toHaveBeenCalledWith(
      "Cache hit for friends posts"
    );
  });

  it("should fetch and combine friends' posts and consumed posts, then cache the result", async () => {
    // Mock Redis cache miss, successful friend ID retrieval, and post retrieval
    Redis.prototype.get.mockResolvedValue(null);
    const mockFriendIds = { data: { friends: ["456", "789"] } };
    const mockFriendsPosts = [
      { id: 4, userId: "456", title: "Friend 1 Post" },
      { id: 5, userId: "789", title: "Friend 2 Post" },
    ];
    const mockConsumedPosts = [{ userId: "456", content: "consumed post" }];
    axios.get.mockResolvedValue({ status: 200, data: mockFriendsPosts });
    const mockBreaker = {
      fire: jest.fn(),
    };
    const CircuitBreaker = require("opossum");
    CircuitBreaker.mockImplementation(() => mockBreaker);
    mockBreaker.fire.mockResolvedValue(mockFriendIds);
    const mockGetConsumedPosts = jest.fn().mockResolvedValue(mockConsumedPosts);

    //mock the internal functions
    const module = require("../controllers/feedController");
    module.GetConsumedPosts = mockGetConsumedPosts;

    // Call the function
    const result = await GetFriendsPosts(req);

    const expectedPosts = [...mockFriendsPosts, ...mockConsumedPosts];

    expect(Redis.prototype.get).toHaveBeenCalledWith("friendsPosts:123");
    expect(mockBreaker.fire).toHaveBeenCalledWith(
      "http://localhost:7474/friend/123"
    );
    expect(axios.get).toHaveBeenCalledTimes(2); // Called for each friend
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.postServiceUrl}/post/456/posts`
    );
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.postServiceUrl}/post/789/posts`
    );
    expect(mockGetConsumedPosts).toHaveBeenCalledWith(["456", "789"]);
    expect(Redis.prototype.set).toHaveBeenCalledWith(
      "friendsPosts:123",
      JSON.stringify(expectedPosts),
      { EX: 3600 }
    );
    expect(result).toEqual(expectedPosts);
    expect(global.console.log).toHaveBeenCalledWith(
      "Personalized feed cached successfully for key:",
      "friendsPosts:123"
    );
  });

  it("should handle errors during friend/post retrieval and return an empty array", async () => {
    // Mock axios to throw an error when fetching friend IDs
    Redis.prototype.get.mockResolvedValue(null);
    const mockBreaker = {
      fire: jest.fn(),
    };
    const CircuitBreaker = require("opossum");
    CircuitBreaker.mockImplementation(() => mockBreaker);
    mockBreaker.fire.mockRejectedValue(new Error("Failed to fetch friends"));

    const result = await GetFriendsPosts(req);

    expect(Redis.prototype.get).toHaveBeenCalledWith("friendsPosts:123");
    expect(mockBreaker.fire).toHaveBeenCalledWith(
      "http://localhost:7474/friend/123"
    );
    expect(result).toEqual([]);
    expect(global.console.log).toHaveBeenCalledWith(
      "Error from GetFriendsPosts ",
      { message: "Failed to fetch friends" }
    );
  });
});
