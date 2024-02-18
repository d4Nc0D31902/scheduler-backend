const express = require("express");
const router = express.Router();

const {
  getAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get("/announcements", getAnnouncements);

router.get(
  "/admin/announcements",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  getAnnouncements
);

router.post("/announcement/new", isAuthenticatedUser, createAnnouncement);
router.get("/announcement/:id", getAnnouncementById);
router
  .route("/admin/announcement/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin","officer"), updateAnnouncement)
  .delete(isAuthenticatedUser, authorizeRoles("admin","officer"), deleteAnnouncement);

module.exports = router;  
