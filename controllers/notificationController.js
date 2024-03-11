const Notification = require("../models/notification");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (You can define your own authentication middleware)

exports.createNotification = async (req, res, next) => {
  try {
    const { message, user } = req.body;

    // Create a new notification
    const newNotification = await Notification.create({
      message,
      user,
    });

    res.status(201).json({
      success: true,
      notification: newNotification,
    });
  } catch (error) {
    next(new ErrorHandler("Notification creation failed", 500));
  }
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private (You can define your own authentication middleware)

// exports.getNotifications = async (req, res, next) => {
//   try {
//     const notifications = await Notification.find();

//     res.status(200).json({
//       success: true,
//       notifications,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to retrieve notifications", 500));
//   }
// };

exports.getNotifications = async (req, res, next) => {
  try {
    // Fetch notifications only for the logged-in user
    const notifications = await Notification.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve notifications", 500));
  }
};

// @desc    Get a single notification by ID
// @route   GET /api/notifications/:id
// @access  Private (You can define your own authentication middleware)

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorHandler("Notification not found", 404));
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve the notification", 500));
  }
};

// @desc    Update a notification by ID
// @route   PUT /api/notifications/:id
// @access  Private (You can define your own authentication middleware)

// exports.updateNotification = async (req, res, next) => {
//   try {
//     const { message, user, status } = req.body;

//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return next(new ErrorHandler("Notification not found", 404));
//     }

//     notification.message = message || notification.message;
//     notification.user = user || notification.user;
//     notification.status = status || notification.status;

//     await notification.save();

//     res.status(200).json({
//       success: true,
//       notification,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to update the notification", 500));
//   }
// };

exports.updateNotifications = async (req, res, next) => {
  try {
    const { status } = req.body;
    await Notification.updateMany(
      { user: req.user._id },
      { $set: { status: status } }
    );
    res.status(200).json({
      success: true,
      message: "Notifications updated",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to update notifications", 500));
  }
};

// @desc    Delete a notification by ID
// @route   DELETE /api/notifications/:id
// @access  Private (You can define your own authentication middleware)

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorHandler("Notification not found", 404));
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to delete the notification", 500));
  }
};
