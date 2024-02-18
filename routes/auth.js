const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser,
} = require("../controllers/authController");

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);

router.post("/password/forgot", forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

router.get("/users", allUsers);


router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.put(
  "/me/update",
  isAuthenticatedUser,
  upload.single("avatar"),
  updateProfile
);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin","officer"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin","officer"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin","officer"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin","officer"), deleteUser);

router.put(
  "/admin/user/deactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  deactivateUser
);
router.put(
  "/admin/user/reactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  reactivateUser
);

router.get("/logout", logout);

module.exports = router;
