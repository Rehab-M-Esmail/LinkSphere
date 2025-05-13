const request = require("supertest");
const express = require("express");
const friendController = require("../microservices/friendService/src/controllers/friendController");
const friend = require("../microservices/friendService/src/models/friend");

// Mock the friend model functions
jest.mock("../models/friend", () => ({
  getUserById: jest.fn(),
  getFriends: jest.fn(),
  addFriendship: jest.fn(),
  removeFriendship: jest.fn(),
}));

const app = express();
app.use(express.json());
app.get("/users/:user_id/friends", friendController.getFriends);
app.post("/friends", friendController.addFriend);
app.delete("/friends", friendController.removeFriend);

describe("Friend Controller Tests", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  describe("getFriends", () => {
    it("should return 200 and a list of friends if successful", async () => {
      const mockUserId = 1;
      const mockFriends = [
        { id: 2, name: "Friend 1" },
        { id: 3, name: "Friend 2" },
      ];
      friend.getUserById.mockResolvedValue({}); // Mock user exists
      friend.getFriends.mockResolvedValue(mockFriends);

      const response = await request(app).get(`/users/${mockUserId}/friends`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockFriends);
      expect(friend.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(friend.getFriends).toHaveBeenCalledWith(mockUserId);
    });

    it("should return 404 if the user is not found", async () => {
      const mockUserId = 1;
      friend.getUserById.mockResolvedValue(null);

      const response = await request(app).get(`/users/${mockUserId}/friends`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "One or both users not found" });
      expect(friend.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(friend.getFriends).not.toHaveBeenCalled();
    });

    it("should return 404 if no friends are found", async () => {
      const mockUserId = 1;
      friend.getUserById.mockResolvedValue({}); // Mock user exists
      friend.getFriends.mockResolvedValue(null);

      const response = await request(app).get(`/users/${mockUserId}/friends`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "No friends found" });
      expect(friend.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(friend.getFriends).toHaveBeenCalledWith(mockUserId);
    });

    it("should return 500 if there is a database error", async () => {
      const mockUserId = 1;
      friend.getUserById.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(`/users/${mockUserId}/friends`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(friend.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(friend.getFriends).not.toHaveBeenCalled();
    });
  });

  describe("addFriend", () => {
    it("should return 201 and a success message if friendship is created", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValue({}); // Mock both users exist
      friend.addFriendship.mockResolvedValue();

      const response = await request(app)
        .post("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        message: "Friendship created successfully",
      });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.getUserById).toHaveBeenCalledWith(mockUsers.userId1);
      expect(friend.getUserById).toHaveBeenCalledWith(mockUsers.userId2);
      expect(friend.addFriendship).toHaveBeenCalledWith(
        mockUsers.userId1,
        mockUsers.userId2
      );
    });

    it("should return 404 if one or both users are not found", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValueOnce({});
      friend.getUserById.mockResolvedValueOnce(null);

      const response = await request(app)
        .post("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "One or both users not found" });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.addFriendship).not.toHaveBeenCalled();
    });

    it("should return 500 if there is a database error", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValue({}); // Mock both users exist
      friend.addFriendship.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.addFriendship).toHaveBeenCalledWith(
        mockUsers.userId1,
        mockUsers.userId2
      );
    });
  });

  describe("removeFriend", () => {
    it("should return 200 and a success message if friendship is removed", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValue({}); // Mock both users exist
      friend.removeFriendship.mockResolvedValue();

      const response = await request(app)
        .delete("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: "Friendship removed successfully",
      });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.getUserById).toHaveBeenCalledWith(mockUsers.userId1);
      expect(friend.getUserById).toHaveBeenCalledWith(mockUsers.userId2);
      expect(friend.removeFriendship).toHaveBeenCalledWith(
        mockUsers.userId1,
        mockUsers.userId2
      );
    });

    it("should return 404 if one or both users are not found", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValueOnce({});
      friend.getUserById.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "One or both users not found" });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.removeFriendship).not.toHaveBeenCalled();
    });

    it("should return 500 if there is a database error", async () => {
      const mockUsers = { userId1: 1, userId2: 2 };
      friend.getUserById.mockResolvedValue({}); // Mock both users exist
      friend.removeFriendship.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete("/friends")
        .send(mockUsers)
        .set("Content-Type", "application/json");

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(friend.getUserById).toHaveBeenCalledTimes(2);
      expect(friend.removeFriendship).toHaveBeenCalledWith(
        mockUsers.userId1,
        mockUsers.userId2
      );
    });
  });
});
