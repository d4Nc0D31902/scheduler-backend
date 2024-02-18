const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deactivateCategory,
  reactivateCategory,
} = require("../controllers/categoryController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get("/categories", getCategories);
router.get(
  "/admin/categories",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  getCategories
);

router.post("/category/new", isAuthenticatedUser, createCategory);
router.get("/category/:id", getCategoryById);

router.put(
  "/admin/category/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  updateCategory
);
router.delete(
  "/admin/category/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  deleteCategory
);

router.put(
  "/admin/category/deactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  deactivateCategory
);
router.put(
  "/admin/category/reactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  reactivateCategory
);

module.exports = router;
