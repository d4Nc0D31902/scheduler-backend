const express = require("express");
const router = express.Router();

const {
  getLocations,
  createLocation,
  getLocationById,
  updateLocation,
  deleteLocation,
  deactivateLocation,
  reactivateLocation,
} = require("../controllers/locationController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get("/locations", getLocations);

router.get(
  "/admin/locations",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  getLocations
);

router.post("/location/new", isAuthenticatedUser, createLocation);
router.get("/location/:id", getLocationById);
router
  .route("/admin/location/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin","officer"), updateLocation)
  .delete(isAuthenticatedUser, authorizeRoles("admin","officer"), deleteLocation);

router.put(
  "/admin/location/deactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  deactivateLocation
);

router.put(
  "/admin/location/reactivate/:id",
  isAuthenticatedUser,
  authorizeRoles("admin","officer"),
  reactivateLocation
);

module.exports = router;
