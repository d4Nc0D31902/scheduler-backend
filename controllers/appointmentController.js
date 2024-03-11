const Appointment = require("../models/appointment");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/user");
const Notification = require("../models/notification");
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
      screenShot,
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

    const requesterNotification = new Notification({
      message: `Your Schedule has been requested titled: ${title}`,
      user: req.user._id,
    });
    await requesterNotification.save();

    const adminsAndOfficers = await User.find({
      role: { $in: ["admin", "officer"] },
    });
    for (const user of adminsAndOfficers) {
      const adminOfficerNotification = new Notification({
        message: "A schedule has been requested",
        user: user._id,
      });
      await adminOfficerNotification.save();
    }

    const emailOptions = {
      email: req.user.email,
      subject: "Schedule Request",
      message: `Your Schedule has been Successfully Requested.
        Schedule Details:
        Title: ${title}
        Location: ${location}
        Description: ${description}
        Time Start: ${timeStart}
        Time End: ${timeEnd}
        Professor: ${professor}
        Status: ${status}
        Reason: ${reason}
      `,
      html: `
      <div class="wrap" style="max-width: 600px; margin: 0 auto;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"
          style="border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <tr>
              <td style="padding: 20px;">
                  <div style="border-bottom: 2px solid #800000; padding-bottom: 20px;">
                      <div style="font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">Technological University
                          of the Philippines - Taguig City</div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Premier State University</div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">14 East Service Road, South Super
                          Highway, Taguig, Metro Manila</div>
                  </div>
                  <div style="margin-top: 20px;">
                      <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Technological_University_of_the_Philippines_Seal.svg/1200px-Technological_University_of_the_Philippines_Seal.svg.png"
                          alt="Logo" style="width: 100px; height: 100px; margin-right: 20px; float: left;">
                      <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Order Confirmation</div>
                      <p style="margin-bottom: 10px;">Your Schedule has been Successfully Requested.</p>
                  </div>
              </td>
          </tr>
      </table>
      <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #800000; margin-bottom: 20px;">Your Schedule has been Successfully Requested!</h2>
  
          <hr style="border: 1px solid #ccc; margin: 20px 0;">
  
          <table style="width: 100%; border-collapse: collapse;">
              <th style="  padding: 8px;">SCHEDULE INFORMATION</th>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;"></th>
                  <th style="border: 1px solid #ccc; padding: 8px;">Details</th>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Title:</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${title}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Description</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${description}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Location</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${location}</td>
              </tr>              
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Date & Time Start</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${timeStart}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Date & Time End</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${timeEnd}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Faculty</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${professor}</td>
              </tr>


              <th style="  padding: 8px;">STATUS REPORTS</th>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;">Status</th>
                  <th style="border: 1px solid #ccc; padding: 8px;">Reason</th>
              </tr>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;"> ${status}</th>
                  <th style="border: 1px solid #ccc; padding: 8px;">${reason}</th>
              </tr>
  
          </table>
      </div>
  </div>
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
    let appointments = await Appointment.find();
    // const updateThreshold = new Date(Date.now() - 60 * 1000);
    const updateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const appointment of appointments) {
      if (
        appointment.createdAt <= updateThreshold &&
        appointment.status === "Pending"
      ) {
        appointment.status = "Overdued";
        const historyLog = {
          schedTitle: appointment.title,
          requester: appointment.requester,
          description: appointment.description,
          location: appointment.location,
          timeStart: appointment.timeStart,
          timeEnd: appointment.timeEnd,
          professor: appointment.professor, // Assuming professor is defined somewhere
          status: "Overdued", // Assuming status is defined somewhere
          by: "N/A",
        };
        appointment.history.push(historyLog);
        await appointment.save();
      }
    }

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

      if (user.penalty === 3) {
        user.status = "inactive";
      }

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

    const requesterNotification = new Notification({
      message: `Your Schedule has been Updated titled: ${title}`,
      user: appointment.userId,
    });
    await requesterNotification.save();

    // Fetch user's email from the User model using appointment.userId
    const user = await User.findById(appointment.userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const emailOptions = {
      email: user.email,
      subject: "Appointment Update",
      message: `Your appointment has been updated. Details: 
        Title: ${title}
        Location: ${location}
        Attendees: ${attendees}
        Time Start: ${timeStart}
        Time End: ${timeEnd}
        Status: ${status}
        Professor: ${professor}
        Reason: ${reason}
        Key: ${key}`,
      html: `
      <div class="wrap" style="max-width: 600px; margin: 0 auto;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff"
          style="border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <tr>
              <td style="padding: 20px;">
                  <div style="border-bottom: 2px solid #800000; padding-bottom: 20px;">
                      <div style="font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">Technological University
                          of the Philippines - Taguig City</div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Premier State University</div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">14 East Service Road, South Super
                          Highway, Taguig, Metro Manila</div>
                  </div>
                  <div style="margin-top: 20px;">
                      <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Technological_University_of_the_Philippines_Seal.svg/1200px-Technological_University_of_the_Philippines_Seal.svg.png"
                          alt="Logo" style="width: 100px; height: 100px; margin-right: 20px; float: left;">
                      <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Order Confirmation</div>
                      <p style="margin-bottom: 10px;">Your Schedule has been Successfully Requested.</p>
                  </div>
              </td>
          </tr>
      </table>
      <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #800000; margin-bottom: 20px;">Your Schedule has been Successfully Requested!</h2>
  
          <hr style="border: 1px solid #ccc; margin: 20px 0;">
  
          <table style="width: 100%; border-collapse: collapse;">
              <th style="  padding: 8px;">SCHEDULE INFORMATION</th>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;"></th>
                  <th style="border: 1px solid #ccc; padding: 8px;">Details</th>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Title:</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${title}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Attendees</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${attendees}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Location</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${location}</td>
              </tr>              
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Date & Time Start</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${timeStart}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Date & Time End</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${timeEnd}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Faculty</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${professor}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Key</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${key}</td>
             </tr>


              <th style="  padding: 8px;">STATUS REPORTS</th>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;">Status</th>
                  <th style="border: 1px solid #ccc; padding: 8px;">Reason</th>
              </tr>
              <tr>
                  <th style="border: 1px solid #ccc; padding: 8px;"> ${status}</th>
                  <th style="border: 1px solid #ccc; padding: 8px;">${reason}</th>
              </tr>
  
          </table>
      </div>
  </div>
      `,
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
