const Appointment = require("../models/appointment");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/user");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("cloudinary");

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (You can define your own authentication middleware)

exports.createAppointment = async (req, res, next) => {
  try {
    const {
      attendees,
      location,
      title,
      description,
      timeStart,
      timeEnd,
      reason,
      professor,
      status,
      key,
      screenShot, // Add screenShot to the destructured request body
    } = req.body;

    let requester = "";

    if (req.user.role === "professor") {
      requester = `${req.user.name} - ${req.user.department}`;
    } else {
      requester = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;
    }

    // Saving screenshots to Cloudinary
    let screenShotLinks = [];
    if (screenShot && screenShot.length > 0) {
      for (let i = 0; i < screenShot.length; i++) {
        const result = await cloudinary.uploader.upload(screenShot[i], {
          folder: "appointments", // Change the folder name if necessary
        });

        screenShotLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    // Creating the appointment with the screenshot links
    const newAppointment = await Appointment.create({
      userId: req.user._id,
      requester,
      attendees,
      location,
      title,
      description,
      timeStart,
      timeEnd,
      professor,
      status,
      reason,
      key,
      screenShot: screenShotLinks, // Add the screenShot links to the appointment
    });

    const historyLog = {
      schedTitle: title,
      requester,
      location,
      description,
      timeStart,
      timeEnd,
      professor,
      status,
      by: "N/A",
    };

    newAppointment.history.push(historyLog);

    await newAppointment.save();

    // Construct email notification for the appointment
    // Include screenshot links in the email if necessary
    const emailOptions = {
      email: req.user.email,
      subject: "Appointment Created",
      message: `Your appointment has been successfully created.
        Appointment Details:
        Title: ${title}
        Requester: ${requester}
        Location: ${location}
        Description: ${description}
        Time Start: ${timeStart}
        Time End: ${timeEnd}
        Professor: ${professor}
        Status: ${status}
        Reason: ${reason}
      `,
      html: `<p>Your appointment has been successfully created.</p>
        <p>Appointment Details:</p>
        <ul>
          <li>Title: ${title}</li>
          <li>Requester: ${requester}</li>
          <li>Location: ${location}</li>
          <li>Description: ${description}</li>
          <li>Time Start: ${timeStart}</li>
          <li>Time End: ${timeEnd}</li>
          <li>Professor: ${professor}</li>
          <li>Status: ${status}</li>
          <li>Reason: ${reason}</li>
        </ul>
      `,
    };

    // Send email notification
    await sendEmail(emailOptions);

    res.status(201).json({
      success: true,
      newAppointment,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler("Appointment creation failed", 500));
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public (you can define your own access control)

exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve appointments", 500));
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Public (you can define your own access control)

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve the appointment", 500));
  }
};

exports.getSingleAppointment = async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  res.status(200).json({
    success: true,
    appointment,
  });
};

// @desc    Update an appointment by ID
// @route   PUT /api/appointments/:id
// @access  Private (You can define your own authentication middleware)

exports.updateAppointment = async (req, res, next) => {
  try {
    const {
      attendees,
      title,
      location,
      timeStart,
      timeEnd,
      status,
      professor,
      reason,
      key,
    } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    const historyLog = {
      schedTitle: appointment.title,
      requester: appointment.requester,
      description: appointment.description,
      location: appointment.location,
      timeStart: appointment.timeStart,
      timeEnd: appointment.timeEnd,
      professor: professor,
      status: status,
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    };

    if (
      reason === "Reason 1" ||
      reason === "Reason 2" ||
      reason === "Reason 3"
    ) {
      const user = await User.findById(appointment.userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      user.penalty += 1;

      await user.save();
    }

    appointment.attendees = attendees;
    appointment.title = title;
    appointment.location = location;
    appointment.timeStart = timeStart;
    appointment.timeEnd = timeEnd;
    appointment.status = status;
    appointment.professor = professor;
    appointment.reason = reason;
    appointment.key = key;

    appointment.history.push(historyLog);

    await appointment.save();

    // Fetch user's email from the User model using appointment.userId
    const user = await User.findById(appointment.userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Construct email notification for appointment update
    const emailOptions = {
      email: user.email,
      subject: "Appointment Update",
      message: `Your appointment has been updated.`,
      html: `<p>Your appointment has been updated.</p>`,
    };

    // Send email notification
    await sendEmail(emailOptions);

    res.status(200).json({
      success: true,
      appointment: appointment,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to update the appointment", 500));
  }
};

// Helper function to format date
const formatDate = (date) => {
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleString("en-US", options).replace(/,/g, ""); // Replace comma after year
};

// @desc    Delete an appointment by ID
// @route   DELETE /api/appointments/:id
// @access  Private (You can define your own access control)

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    await appointment.remove();
    res.status(200).json({
      success: true,
      message: "Appointment deleted",
    });
  } catch (error) {
    next(new ErrorHandler("Failed to delete the appointment", 500));
  }
};

exports.myAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to retrieve user appointments", 500));
  }
};

exports.joinAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    // Check if the appointment is already joined by the user
    if (appointment.attendees.includes(req.user.name)) {
      return next(new ErrorHandler("User already joined the appointment", 400));
    }

    // Add the user to the attendees list
    appointment.attendees.push(req.user.name);

    // Update the requester field
    appointment.requester = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;

    const updatedAppointment = await appointment.save();

    res.status(200).json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(new ErrorHandler("Failed to join the appointment", 500));
  }
};
