const express = require("express");
const router = express.Router();
const {
  newBorrowing,
  getSingleBorrowing,
  myBorrowings,
  allBorrowings,
  updateBorrowing,
  deleteBorrowing,
} = require("../controllers/borrowController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/borrow/new", isAuthenticatedUser, newBorrowing);
router.route("/borrow/:id").get(isAuthenticatedUser, getSingleBorrowing);
router.get("/borrows/me", isAuthenticatedUser, myBorrowings);
router.get(
  "/admin/borrows",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  allBorrowings
);
router
  .route("/admin/borrow/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin","officer"), updateBorrowing)
  .delete(isAuthenticatedUser, authorizeRoles("admin","officer"), deleteBorrowing);

module.exports = router;
