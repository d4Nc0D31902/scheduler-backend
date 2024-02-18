const Appointment = require("../models/appointment");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/user");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (You can define your own authentication middleware)
// exports.createAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       reason,
//       key,
//     } = req.body;

//     const status = "Pending";

//     const newAppointment = await Appointment.create({
//       userId: req.user._id,
//       requester: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       status,
//       reason,
//       key,
//     });

//     res.status(201).json({
//       success: true,
//       newAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler("Appointment creation failed", 500));
//   }
// };

// exports.createAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       reason,
//       professor, // Include professor here
//       key,
//     } = req.body;

//     const status = "Pending";

//     const newAppointment = await Appointment.create({
//       userId: req.user._id,
//       requester: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       professor,
//       status,
//       reason,
//       key,
//     });

//     const historyLog = {
//       schedTitle: title,
//       requester: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       location,
//       description,
//       timeStart,
//       timeEnd,
//       professor,
//       status,
//       by: "N/A",
//     };

//     newAppointment.history.push(historyLog);

//     await newAppointment.save();

//     res.status(201).json({
//       success: true,
//       newAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler("Appointment creation failed", 500));
//   }
// };

// exports.createAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       reason,
//       professor, // Include professor here
//       status,
//       key,
//     } = req.body;

//     // const status = "Pending";
//     let requester = "";

//     if (req.user.role === "professor") {
//       requester = `${req.user.name} - ${req.user.department}`;
//     } else {
//       requester = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;
//     }

//     const newAppointment = await Appointment.create({
//       userId: req.user._id,
//       requester,
//       attendees,
//       location,
//       title,
//       description,
//       timeStart,
//       timeEnd,
//       professor,
//       status,
//       reason,
//       key,
//     });

//     const historyLog = {
//       schedTitle: title,
//       requester,
//       location,
//       description,
//       timeStart,
//       timeEnd,
//       professor,
//       status,
//       by: "N/A",
//     };

//     newAppointment.history.push(historyLog);

//     await newAppointment.save();

//     res.status(201).json({
//       success: true,
//       newAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler("Appointment creation failed", 500));
//   }
// };

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
    } = req.body;

    // const status = "Pending";
    let requester = "";

    if (req.user.role === "professor") {
      requester = `${req.user.name} - ${req.user.department}`;
    } else {
      requester = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;
    }

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

    // Send email notification
    // const emailOptions = {
    //   email: req.user.email, // Assuming req.user.email is the user's email
    //   subject: "Appointment Created",
    //   message: "Your appointment has been successfully created.",
    //   html: "<p>Your appointment has been successfully created.</p>",
    // };
    const options = {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formattedTimeStart = timeStart.toLocaleString("en-US", options);
    const formattedTimeEnd = timeEnd.toLocaleString("en-US", options);

    const emailOptions = {
      email: req.user.email, // Assuming req.user.email is the user's email
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

// exports.updateAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       title,
//       location,
//       timeStart,
//       timeEnd,
//       status,
//       reason,
//       key,
//     } = req.body;
//     const appointment = await Appointment.findById(req.params.id);

//     if (!appointment) {
//       return next(new ErrorHandler("Appointment not found", 404));
//     }

//     // Update appointment properties
//     appointment.attendees = attendees;
//     appointment.title = title;
//     appointment.location = location;
//     appointment.timeStart = timeStart;
//     appointment.timeEnd = timeEnd;
//     appointment.status = status;
//     appointment.reason = reason;
//     appointment.key = key;

//     const updatedAppointment = await appointment.save();

//     res.status(200).json({
//       success: true,
//       appointment: updatedAppointment,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to update the appointment", 500));
//   }
// };

// exports.updateAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       title,
//       location,
//       timeStart,
//       timeEnd,
//       status,
//       professor,
//       reason,
//       key,
//     } = req.body;

//     const appointment = await Appointment.findById(req.params.id);

//     if (!appointment) {
//       return next(new ErrorHandler("Appointment not found", 404));
//     }

//     const historyLog = {
//       schedTitle: appointment.title,
//       requester: appointment.requester,
//       description: appointment.description,
//       location: appointment.location,
//       timeStart: appointment.timeStart,
//       timeEnd: appointment.timeEnd,
//       professor: professor,
//       status: status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     appointment.attendees = attendees;
//     appointment.title = title;
//     appointment.location = location;
//     appointment.timeStart = timeStart;
//     appointment.timeEnd = timeEnd;
//     appointment.status = status;
//     appointment.professor = professor;
//     appointment.reason = reason;
//     appointment.key = key;

//     appointment.history.push(historyLog);

//     const updatedAppointment = await appointment.save();

//     res.status(200).json({
//       success: true,
//       appointment: updatedAppointment,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to update the appointment", 500));
//   }
// };

// exports.updateAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       title,
//       location,
//       timeStart,
//       timeEnd,
//       status,
//       professor,
//       reason,
//       key,
//     } = req.body;

//     const appointment = await Appointment.findById(req.params.id);

//     if (!appointment) {
//       return next(new ErrorHandler("Appointment not found", 404));
//     }

//     const historyLog = {
//       schedTitle: appointment.title,
//       requester: appointment.requester,
//       description: appointment.description,
//       location: appointment.location,
//       timeStart: appointment.timeStart,
//       timeEnd: appointment.timeEnd,
//       professor: professor,
//       status: status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     if (
//       reason === "Reason 1" ||
//       reason === "Reason 2" ||
//       reason === "Reason 3"
//     ) {
//       const user = await User.findById(appointment.userId);

//       if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//       }

//       user.penalty += 1;

//       await user.save();
//     }

//     appointment.attendees = attendees;
//     appointment.title = title;
//     appointment.location = location;
//     appointment.timeStart = timeStart;
//     appointment.timeEnd = timeEnd;
//     appointment.status = status;
//     appointment.professor = professor;
//     appointment.reason = reason;
//     appointment.key = key;

//     appointment.history.push(historyLog);

//     await appointment.save();

//     res.status(200).json({
//       success: true,
//       appointment: appointment,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to update the appointment", 500));
//   }
// };

// exports.updateAppointment = async (req, res, next) => {
//   try {
//     const {
//       attendees,
//       title,
//       location,
//       timeStart,
//       timeEnd,
//       status,
//       professor,
//       reason,
//       key,
//     } = req.body;

//     const appointment = await Appointment.findById(req.params.id);

//     if (!appointment) {
//       return next(new ErrorHandler("Appointment not found", 404));
//     }

//     const historyLog = {
//       schedTitle: appointment.title,
//       requester: appointment.requester,
//       description: appointment.description,
//       location: appointment.location,
//       timeStart: appointment.timeStart,
//       timeEnd: appointment.timeEnd,
//       professor: professor,
//       status: status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     if (
//       reason === "Reason 1" ||
//       reason === "Reason 2" ||
//       reason === "Reason 3"
//     ) {
//       const user = await User.findById(appointment.userId);

//       if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//       }

//       user.penalty += 1;

//       if (user.penalty === 3) {
//         user.status = "inactive";
//       }

//       await user.save();
//     }

//     appointment.attendees = attendees;
//     appointment.title = title;
//     appointment.location = location;
//     appointment.timeStart = timeStart;
//     appointment.timeEnd = timeEnd;
//     appointment.status = status;
//     appointment.professor = professor;
//     appointment.reason = reason;
//     appointment.key = key;

//     appointment.history.push(historyLog);

//     await appointment.save();

//     res.status(200).json({
//       success: true,
//       appointment: appointment,
//     });
//   } catch (error) {
//     next(new ErrorHandler("Failed to update the appointment", 500));
//   }
// };

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

    // Retrieve user's email from the User model
    const user = await User.findById(appointment.userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const userEmail = user.email;

    // Email notification
    const emailOptions = {
      email: userEmail,
      subject: "Appointment Updated",
      message:
        `Your appointment has been successfully updated.\n\n` +
        `Appointment Information:\n` +
        `Title: ${title}\n` +
        `Location: ${location}\n` +
        `Time Start: ${formatDate(timeStart)}\n` +
        `Time End: ${formatDate(timeEnd)}\n` +
        `Status: ${userStatus}\n`, // Include user's status
      html:
        `<p>Your appointment has been successfully updated.</p>` +
        `<p><strong>Appointment Information:</strong></p>` +
        `<p><strong>Title:</strong> ${title}</p>` +
        `<p><strong>Location:</strong> ${location}</p>` +
        `<p><strong>Time Start:</strong> ${formatDate(timeStart)}</p>` +
        `<p><strong>Time End:</strong> ${formatDate(timeEnd)}</p>` +
        `<p><strong>Status:</strong> ${userStatus}</p>`, // Include user's status
    };

    await sendEmail(emailOptions); // Send email

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
