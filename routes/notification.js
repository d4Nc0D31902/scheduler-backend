const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getNotificationById,
  // updateNotification,
  updateNotifications, // Add the new controller function for updating multiple notifications
  deleteNotification,
} = require("../controllers/notificationController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/notification/new", isAuthenticatedUser, createNotification);
router.get("/notifications", isAuthenticatedUser, getNotifications);
router.get("/notifications/:id", isAuthenticatedUser, getNotificationById);
// router.put("/notifications/:id", isAuthenticatedUser, updateNotification);
router.put("/notifications/update", isAuthenticatedUser, updateNotifications); 
router.delete("/notifications/:id", isAuthenticatedUser, deleteNotification);

module.exports = router;
