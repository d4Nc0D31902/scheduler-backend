const express = require("express");
const router = express.Router();

const {
  updateSettingsById,
  getSettingsById,
} = require("../controllers/settingsController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");


router.put(
  "/settings/6581a5b1466cfcabab4cc84f",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  updateSettingsById
);

router.get("/settings/6581a5b1466cfcabab4cc84f", getSettingsById);

module.exports = router;
