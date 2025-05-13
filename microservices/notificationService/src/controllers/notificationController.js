const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json(notification);
};

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.params.userId });
  res.status(200).json(notifications);
};

exports.markAsRead = async (req, res) => {
  const updated = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  res.status(200).json(updated);
};

exports.deleteNotification = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
