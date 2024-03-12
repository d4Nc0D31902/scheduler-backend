const Announcement = require("../models/announcement");
const ErrorHandler = require("../utils/errorHandler");
const Notification = require("../models/notification");
const User = require("../models/user");
const cloudinary = require("cloudinary");

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private

exports.createAnnouncement = async (req, res, next) => {
  let images = Array.isArray(req.body.images)
    ? req.body.images
    : [req.body.images];

  images = images.map((image) => {
    if (typeof image === "string") {
      return image;
    } else {
      // Handle invalid image format (optional)
      return null;
    }
  });

  // Remove any null values from the array
  images = images.filter((image) => image !== null);

  if (images.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Images array is empty",
    });
  }

  let imagesLinks = [];

  try {
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "announcements",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const announcement = await Announcement.create({
      user: req.user.id, // Set user field to ObjectId
      title: req.body.title,
      body: req.body.body,
      images: imagesLinks,
    });

    const requesterNotification = new Notification({
      message: `New Announcement!`,
      type: "created",
      user: req.user._id,
    });
    await requesterNotification.save();

    res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public (you can define your own access control)

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().populate("user", "name"); // Populate user information if needed
    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve announcements", 500));
  }
};

// @desc    Get a single announcement by ID
// @route   GET /api/announcements/:id
// @access  Public (you can define your own access control)

exports.getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "user",
      "name"
    ); // Populate user information if needed

    if (!announcement) {
      return next(new ErrorHandler("Announcement not found", 404));
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve the announcement", 500));
  }
};

// @desc    Update an announcement by ID
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)

exports.updateAnnouncement = async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorHandler("Announcement not found", 404));
  }

  let images = req.body.images; // Get images from the request body

  if (images) {
    // Check if images is defined
    if (typeof images === "string") {
      images = [images]; // Convert to an array if it's a string
    }

    // Deleting images associated with the announcement
    for (let i = 0; i < announcement.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(
        announcement.images[i].public_id
      );
    }

    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "announcements",
      });
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLinks;
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  return res.status(200).json({
    success: true,
    announcement,
  });
};

// @desc    Delete an announcement by ID
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorHandler("Announcement not found", 404));
    }

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return next(
        new ErrorHandler(
          "Unauthorized. Only admins can delete announcements.",
          403
        )
      );
    }

    await announcement.remove();
    res.status(200).json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to delete the announcement", 500));
  }
};
