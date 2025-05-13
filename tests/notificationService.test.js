//The service will be rebuilt again
const request = require("supertest");
const express = require("express");
const notificationController = require("../microservices/notificationService/src/controllers/notificationController");
const Notification = require("../microservices/notificationService/src/models/notificationModel");
const mongoose = require("mongoose");

// Mock the Notification model
jest.mock(
  "../microservices/notificationService/src/models/notificationModel.js",
  () => {
    const Notification = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    return Notification;
  }
);

// Create a mock Express app
const app = express();
app.use(express.json());

// Define routes for the notification controller
app.post("/notifications", notificationController.createNotification);
app.get("/notifications/:userId", notificationController.getNotifications);
app.patch("/notifications/:id/read", notificationController.markAsRead);
app.delete("/notifications/:id", notificationController.deleteNotification);

// Helper function to create a mock response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res); // Add mock for end
  return res;
};

describe("Notification Controller Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = mockResponse();
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  describe("createNotification", () => {
    it("should create a notification and return 201 status", async () => {
      // Mock the Notification.create method
      const mockNotification = { _id: "someId", content: "Test Notification" };
      Notification.create.mockResolvedValue(mockNotification);

      // Set the request body
      req.body = { content: "Test Notification" };

      // Call the controller function
      await notificationController.createNotification(req, res);

      // Assertions
      expect(Notification.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNotification);
    });

    it("should handle errors during notification creation", async () => {
      const errorMessage = "Failed to create notification";
      Notification.create.mockRejectedValue(new Error(errorMessage));

      req.body = { content: "Test Notification" };

      // Directly call the controller
      try {
        await notificationController.createNotification(req, res);
      } catch (error) {
        // Assertions
        expect(Notification.create).toHaveBeenCalledWith(req.body);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      }
    });
  });

  describe("getNotifications", () => {
    it("should get notifications for a user and return 200 status", async () => {
      // Mock the Notification.find method
      const mockNotifications = [
        { _id: "id1", content: "Notification 1", userId: "user1" },
        { _id: "id2", content: "Notification 2", userId: "user1" },
      ];
      Notification.find.mockResolvedValue(mockNotifications);

      // Set the request parameters
      req.params.userId = "user1";

      // Call the controller function
      await notificationController.getNotifications(req, res);

      // Assertions
      expect(Notification.find).toHaveBeenCalledWith({ userId: "user1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });

    it("should handle errors during fetching notifications", async () => {
      const errorMessage = "Failed to fetch notifications";
      Notification.find.mockRejectedValue(new Error(errorMessage));
      req.params.userId = "user1";

      // Directly call the controller
      try {
        await notificationController.getNotifications(req, res);
      } catch (error) {
        expect(Notification.find).toHaveBeenCalledWith({ userId: "user1" });
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      }
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read and return 200 status", async () => {
      // Mock the Notification.findByIdAndUpdate method
      const mockUpdatedNotification = {
        _id: "someId",
        content: "Updated Notification",
        isRead: true,
      };
      Notification.findByIdAndUpdate.mockResolvedValue(mockUpdatedNotification);

      // Set the request parameters
      req.params.id = "someId";

      // Call the controller function
      await notificationController.markAsRead(req, res);

      // Assertions
      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        "someId",
        { isRead: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedNotification);
    });

    it("should handle errors when marking notification as read", async () => {
      const errorMessage = "Failed to mark as read";
      Notification.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));
      req.params.id = "someId";

      // Directly call the controller
      try {
        await notificationController.markAsRead(req, res);
      } catch (error) {
        expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
          "someId",
          { isRead: true },
          { new: true }
        );
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      }
    });
  });

  describe("deleteNotification", () => {
    it("should delete a notification and return 204 status", async () => {
      // Mock the Notification.findByIdAndDelete method
      Notification.findByIdAndDelete.mockResolvedValue();

      // Set the request parameters
      req.params.id = "someId";

      // Call the controller function
      await notificationController.deleteNotification(req, res);

      // Assertions
      expect(Notification.findByIdAndDelete).toHaveBeenCalledWith("someId");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should handle errors during deletion", async () => {
      const errorMessage = "Failed to delete notification";
      Notification.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));
      req.params.id = "someId";
      // Directly call the controller
      try {
        await notificationController.deleteNotification(req, res);
      } catch (error) {
        expect(Notification.findByIdAndDelete).toHaveBeenCalledWith("someId");
        expect(res.status).not.toHaveBeenCalled();
        expect(res.end).not.toHaveBeenCalled();
      }
    });
  });
});
