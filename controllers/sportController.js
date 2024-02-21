const Sport = require("../models/sport");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Create a new sport
// @route   POST /api/sports
// @access  Private (You can define your own authentication middleware)

exports.createSport = async (req, res, next) => {
  try {
    const { name } = req.body;

    const newSport = await Sport.create({
      name,
    });

    newSport.history.push({
      name: newSport.name,
      status: newSport.status,
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    });

    await newSport.save();

    res.status(201).json({
      success: true,
      newSport,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler("Sport creation failed", 500));
  }
};

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public (you can define your own access control)

exports.getSports = async (req, res, next) => {
  try {
    const sports = await Sport.find();
    res.status(200).json({
      success: true,
      sports,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve sports", 500));
  }
};

// @desc    Get a single sport by ID
// @route   GET /api/sports/:id
// @access  Public (you can define your own access control)

exports.getSportById = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return next(new ErrorHandler("Sport not found", 404));
    }

    res.status(200).json({
      success: true,
      sport,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve the sport", 500));
  }
};

// @desc    Update a sport by ID
// @route   PUT /api/sports/:id
// @access  Private (You can define your own authentication middleware)

exports.updateSport = async (req, res, next) => {
  try {
    const { name } = req.body;
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return next(new ErrorHandler("Sport not found", 404));
    }

    // Update sport properties
    sport.name = name;

    // Create a history log before updating
    const historyLog = {
      name: sport.name,
      status: sport.status,
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    };

    // Push the history log into the sport's history array
    sport.history.push(historyLog);

    const updatedSport = await sport.save();

    res.status(200).json({
      success: true,
      sport: updatedSport,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to update the sport", 500));
  }
};

// @desc    Delete a sport by ID
// @route   DELETE /api/sports/:id
// @access  Private (You can define your own access control)

exports.deleteSport = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return next(new ErrorHandler("Sport not found", 404));
    }

    await sport.remove();
    res.status(200).json({
      success: true,
      message: "Sport deleted",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to delete the sport", 500));
  }
};

// exports.deactivateSport = async (req, res, next) => {
//   try {
//     const sport = await Sport.findById(req.params.id);

//     if (!sport) {
//       return next(new ErrorHandler("Sport not found", 404));
//     }

//     sport.status = "inactive";
//     await sport.save();

//     res.status(200).json({
//       success: true,
//       message: "Sport deactivated",
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to deactivate the sport", 500));
//   }
// };

// // @desc    Reactivate a sport by ID
// // @route   PUT /api/sports/:id/reactivate
// // @access  Private (You can define your own authentication middleware)

// exports.reactivateSport = async (req, res, next) => {
//   try {
//     const sport = await Sport.findById(req.params.id);

//     if (!sport) {
//       return next(new ErrorHandler("Sport not found", 404));
//     }

//     sport.status = "active";
//     await sport.save();

//     res.status(200).json({
//       success: true,
//       message: "Sport reactivated",
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to reactivate the sport", 500));
//   }
// };

exports.deactivateSport = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return next(new ErrorHandler("Sport not found", 404));
    }

    sport.status = "inactive";

    // Create a new history entry
    const historyEntry = {
      name: sport.name,
      status: "inactive",
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    };

    // Push the history entry to the history array
    sport.history.push(historyEntry);

    const deactivatedSport = await sport.save();

    res.status(200).json({
      success: true,
      sport: deactivatedSport,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to deactivate the sport", 500));
  }
};

exports.reactivateSport = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return next(new ErrorHandler("Sport not found", 404));
    }

    sport.status = "active";

    // Create a new history entry
    const historyEntry = {
      name: sport.name,
      status: "active",
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    };

    // Push the history entry to the history array
    sport.history.push(historyEntry);

    const reactivatedSport = await sport.save();

    res.status(200).json({
      success: true,
      sport: reactivatedSport,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to reactivate the sport", 500));
  }
};
