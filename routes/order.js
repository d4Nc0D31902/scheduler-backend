const express = require("express");
const router = express.Router();
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
  totalOrders,
  totalSales,
  customerSales,
  salesPerMonth,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/order/new", isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);
router
  .route("/admin/orders/")
  .get(isAuthenticatedUser, authorizeRoles("admin","officer"), allOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin","officer"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin","officer"), deleteOrder);

router.get("/orders/total-orders", totalOrders);
router.get("/orders/total-sales", totalSales);
router.get("/orders/customer-sales", customerSales);
router.get("/orders/sales-per-month", salesPerMonth);
module.exports = router;
