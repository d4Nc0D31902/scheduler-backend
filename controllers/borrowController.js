const Borrowing = require("../models/borrowing");
const Equipment = require("../models/equipment");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");

const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

// exports.newBorrowing = async (req, res, next) => {
//   const {
//     // userId,
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//   } = req.body;
//   const borrowing = await Borrowing.create({
//     userId: req.user._id,
//     user: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//   });

//   res.status(200).json({
//     success: true,
//     borrowing,
//   });
// };

// exports.newBorrowing = async (req, res, next) => {
//   const {
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//   } = req.body;

//   const borrowing = await Borrowing.create({
//     userId: req.user._id,
//     user: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//     history: [
//       {
//         user: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//         borrowItems,
//         status,
//         by: "N/A",
//         date_return,
//         date_borrow: borrowingInfo.date_borrow, // Adding date_borrow
//       },
//     ],
//   });

//   res.status(200).json({
//     success: true,
//     borrowing,
//   });
// };

// exports.newBorrowing = async (req, res, next) => {
//   const {
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//   } = req.body;

//   let userDetail = "";

//   if (req.user.role === "professor") {
//     userDetail = `${req.user.name} - ${req.user.department}`;
//   } else {
//     userDetail = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;
//   }

//   const borrowing = await Borrowing.create({
//     userId: req.user._id,
//     user: userDetail,
//     borrowItems,
//     borrowingInfo,
//     date_return,
//     issue,
//     status,
//     reason_status,
//     history: [
//       {
//         user: userDetail,
//         borrowItems,
//         status,
//         by: "N/A",
//         date_return,
//         date_borrow: borrowingInfo.date_borrow, // Adding date_borrow
//       },
//     ],
//   });

//   res.status(200).json({
//     success: true,
//     borrowing,
//   });
// };

exports.newBorrowing = async (req, res, next) => {
  const {
    borrowItems,
    borrowingInfo,
    date_return,
    issue,
    status,
    reason_status,
  } = req.body;

  let userDetail = "";

  if (req.user.role === "professor") {
    userDetail = `${req.user.name} - ${req.user.department}`;
  } else {
    userDetail = `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`;
  }

  const borrowing = await Borrowing.create({
    userId: req.user._id,
    user: userDetail,
    borrowItems,
    borrowingInfo,
    date_return,
    issue,
    status,
    reason_status,
    history: [
      {
        user: userDetail,
        borrowItems,
        status,
        by: "N/A",
        date_return,
        date_borrow: borrowingInfo.date_borrow, // Adding date_borrow
      },
    ],
  });

  // Construct email notification with borrowing information
  const emailOptions = {
    email: req.user.email,
    subject: "Borrowing of Equipment Request",
    message: `
      Your borrowing request has been successfully created.
      
      Borrowing Information:
      Borrow Items: ${borrowItems}
      Borrowing Info: ${borrowingInfo}
      Date of Return: ${date_return}
      Issue: ${issue}
      Status: ${status}
      Reason for Status: ${reason_status}
    `,
    html: `
      <p>Your borrowing request has been successfully created.</p>
      <p><strong>Borrowing Information:</strong></p>
      <p><strong>Borrow Items:</strong> ${borrowItems}</p>
      <p><strong>Borrowing Info:</strong> ${borrowingInfo}</p>
      <p><strong>Date of Return:</strong> ${date_return}</p>
      <p><strong>Issue:</strong> ${issue}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Reason for Status:</strong> ${reason_status}</p>
    `,
  };

  await sendEmail(emailOptions); // Send email

  res.status(200).json({
    success: true,
    borrowing,
  });
};

exports.getSingleBorrowing = async (req, res, next) => {
  const borrowing = await Borrowing.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!borrowing) {
    return next(new ErrorHandler("No Borrowing found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    borrowing,
  });
};

exports.myBorrowings = async (req, res, next) => {
  const borrowings = await Borrowing.find({ userId: req.user._id });
  res.status(200).json({
    success: true,
    borrowings,
  });
};

exports.allBorrowings = async (req, res, next) => {
  const borrowings = await Borrowing.find();
  borrowings.forEach((borrowing) => {});
  res.status(200).json({
    success: true,
    borrowings,
  });
};

// exports.updateBorrowing = async (req, res, next) => {
//   const borrowing = await Borrowing.findById(req.params.id);
//   if (!borrowing) {
//     return next(new ErrorHandler("Borrowing not found", 404));
//   }

//   if (borrowing.status === "Returned") {
//     return next(
//       new ErrorHandler("This borrowing has already been returned", 400)
//     );
//   }

//   borrowing.borrowItems.forEach(async (item) => {
//     const equipment = await Equipment.findById(item.equipment);
//     if (!equipment) {
//       throw new Error("Equipment not found");
//     }

//     if (borrowing.status === "Borrowed") {
//       equipment.stock -= item.quantity;
//     } else if (borrowing.status === "Returned") {
//       equipment.stock += item.quantity;
//     }

//     await equipment.save();
//   });

//   borrowing.status = req.body.status;
//   borrowing.date_return = borrowing.status === "Returned" ? Date.now() : null; // Set date_returned based on status
//   borrowing.reason_status = req.body.reason_status; // Update reason_status
//   borrowing.issue = req.body.issue; // Update issue

//   await borrowing.save();

//   res.status(200).json({ success: true });
// };

// exports.updateBorrowing = async (req, res, next) => {
//   try {
//     const borrowing = await Borrowing.findById(req.params.id);
//     if (!borrowing) {
//       return next(new ErrorHandler("Borrowing not found", 404));
//     }

//     if (borrowing.status === "Returned") {
//       return next(
//         new ErrorHandler("This borrowing has already been returned", 400)
//       );
//     }

//     if (req.body.status === "Borrowed") {
//       borrowing.borrowItems.forEach(async (item) => {
//         const equipment = await Equipment.findById(item.equipment);
//         if (!equipment) {
//           return next(new ErrorHandler("Equipment not found", 404));
//         }
//         equipment.stock -= item.quantity;
//         await equipment.save();
//       });
//     }

//     if (req.body.status === "Returned") {
//       borrowing.borrowItems.forEach(async (item) => {
//         const equipment = await Equipment.findById(item.equipment);
//         if (!equipment) {
//           return next(new ErrorHandler("Equipment not found", 404));
//         }
//         equipment.stock += item.quantity;
//         await equipment.save();
//       });
//     }

//     const historyObj = {
//       user: borrowing.user,
//       borrowItems: borrowing.borrowItems,
//       date_borrow: borrowing.borrowingInfo.date_borrow,
//       date_return: req.body.status === "Returned" ? Date.now() : null,
//       status: req.body.status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     borrowing.history.push(historyObj);

//     borrowing.status = req.body.status;
//     borrowing.date_return = req.body.status === "Returned" ? Date.now() : null;
//     borrowing.reason_status = req.body.reason_status;
//     borrowing.issue = req.body.issue;

//     await borrowing.save();

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateBorrowing = async (req, res, next) => {
//   try {
//     const borrowing = await Borrowing.findById(req.params.id);
//     if (!borrowing) {
//       return next(new ErrorHandler("Borrowing not found", 404));
//     }

//     if (borrowing.status === "Returned") {
//       return next(
//         new ErrorHandler("This borrowing has already been returned", 400)
//       );
//     }

//     const equipmentHistory = [];

//     for (const item of borrowing.borrowItems) {
//       const equipment = await Equipment.findById(item.equipment);
//       if (!equipment) {
//         return next(new ErrorHandler("Equipment not found", 404));
//       }

//       const itemHistory = {
//         name: item.name,
//         quantity: item.quantity,
//         status: req.body.status,
//         by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       };

//       equipment.stockHistory.push(itemHistory);

//       if (req.body.status === "Borrowed") {
//         equipment.stock -= item.quantity;
//       } else if (req.body.status === "Returned") {
//         equipment.stock += item.quantity;
//       }

//       await equipment.save();
//     }

//     const historyObj = {
//       user: borrowing.user,
//       borrowItems: equipmentHistory,
//       date_borrow: borrowing.borrowingInfo.date_borrow,
//       date_return: req.body.status === "Returned" ? Date.now() : null,
//       status: req.body.status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     borrowing.history.push(historyObj);

//     borrowing.status = req.body.status;
//     borrowing.date_return = req.body.status === "Returned" ? Date.now() : null;
//     borrowing.reason_status = req.body.reason_status;
//     borrowing.issue = req.body.issue;

//     await borrowing.save();

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateBorrowing = async (req, res, next) => {
//   try {
//     const borrowing = await Borrowing.findById(req.params.id);
//     if (!borrowing) {
//       return next(new ErrorHandler("Borrowing not found", 404));
//     }

//     const equipmentHistory = [];

//     for (const item of borrowing.borrowItems) {
//       const equipment = await Equipment.findById(item.equipment);
//       if (!equipment) {
//         return next(new ErrorHandler("Equipment not found", 404));
//       }

//       const itemHistory = {
//         name: item.name,
//         quantity: item.quantity,
//         status: req.body.status,
//         by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       };

//       equipment.stockHistory.push(itemHistory);

//       if (req.body.status === "Borrowed") {
//         equipment.stock -= item.quantity;
//       } else if (req.body.status === "Returned") {
//         equipment.stock += item.quantity;
//       }

//       await equipment.save();
//     }

//     const historyObj = {
//       user: borrowing.user,
//       borrowItems: borrowing.borrowItems,
//       date_borrow: borrowing.borrowingInfo.date_borrow,
//       date_return: req.body.status === "Returned" ? Date.now() : null,
//       status: req.body.status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     borrowing.history.push(historyObj);

//     borrowing.status = req.body.status;
//     borrowing.date_return = req.body.status === "Returned" ? Date.now() : null;
//     borrowing.reason_status = req.body.reason_status;
//     borrowing.issue = req.body.issue;

//     await borrowing.save();

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateBorrowing = async (req, res, next) => {
//   try {
//     const borrowing = await Borrowing.findById(req.params.id);
//     if (!borrowing) {
//       return next(new ErrorHandler("Borrowing not found", 404));
//     }

//     const equipmentHistory = [];

//     for (const item of borrowing.borrowItems) {
//       const equipment = await Equipment.findById(item.equipment);
//       if (!equipment) {
//         return next(new ErrorHandler("Equipment not found", 404));
//       }

//       const itemHistory = {
//         name: item.name,
//         quantity: item.quantity,
//         status: req.body.status,
//         by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       };

//       equipment.stockHistory.push(itemHistory);

//       if (req.body.status === "Borrowed") {
//         equipment.stock -= item.quantity;
//       } else if (req.body.status === "Returned") {
//         equipment.stock += item.quantity;
//       }

//       await equipment.save();
//     }

//     const historyObj = {
//       user: borrowing.user,
//       borrowItems: borrowing.borrowItems,
//       date_borrow: borrowing.borrowingInfo.date_borrow,
//       date_return: req.body.status === "Returned" ? Date.now() : null,
//       status: req.body.status,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     borrowing.history.push(historyObj);

//     borrowing.status = req.body.status;
//     borrowing.date_return = req.body.status === "Returned" ? Date.now() : null;
//     borrowing.reason_status = req.body.reason_status || "N/A";
//     borrowing.issue = req.body.issue || "N/A";

//     await borrowing.save();

//     // Fetch user's email from the User model using borrowing.userId
//     const user = await User.findById(borrowing.userId);
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Construct email notification for borrowing update
//     const emailOptions = {
//       email: user.email,
//       subject: "Borrowing of Equipment Update",
//       message: `Your borrowing has been updated.`,
//       html: `<p>Your borrowing has been updated.</p>`,
//     };

//     // Send email notification
//     await sendEmail(emailOptions);

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateBorrowing = async (req, res, next) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return next(new ErrorHandler("Borrowing not found", 404));
    }

    const equipmentHistory = [];

    for (const item of borrowing.borrowItems) {
      const equipment = await Equipment.findById(item.equipment);
      if (!equipment) {
        return next(new ErrorHandler("Equipment not found", 404));
      }

      const itemHistory = {
        name: item.name,
        quantity: item.quantity,
        status: req.body.status,
        by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
      };

      equipment.stockHistory.push(itemHistory);

      if (req.body.status === "Borrowed") {
        equipment.stock -= item.quantity;
      } else if (req.body.status === "Returned") {
        equipment.stock += item.quantity;
      }

      await equipment.save();
    }

    const historyObj = {
      user: borrowing.user,
      borrowItems: borrowing.borrowItems,
      date_borrow: borrowing.borrowingInfo.date_borrow,
      date_return: req.body.status === "Returned" ? Date.now() : null,
      status: req.body.status,
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
    };

    borrowing.history.push(historyObj);

    borrowing.status = req.body.status;
    borrowing.date_return = req.body.status === "Returned" ? Date.now() : null;
    borrowing.reason_status = req.body.reason_status || "N/A";
    borrowing.issue = req.body.issue || "N/A";

    await borrowing.save();

    // Fetch user's email from the User model using borrowing.userId
    const user = await User.findById(borrowing.userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Update user's penalty based on reason_status
    if (req.body.reason_status !== "N/A") {
      user.penalty += 1;
      await user.save();
    }

    // Construct email notification for borrowing update
    const emailOptions = {
      email: user.email,
      subject: "Borrowing of Equipment Update",
      message: `Your borrowing has been updated.`,
      html: `<p>Your borrowing has been updated.</p>`,
    };

    // Send email notification
    await sendEmail(emailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.deleteBorrowing = async (req, res, next) => {
  const borrowing = await Borrowing.findById(req.params.id);

  if (!borrowing) {
    return next(new ErrorHandler("No Borrowing found with this ID", 404));
  }

  await borrowing.remove();

  res.status(200).json({
    success: true,
  });
};

async function updateEquipmentStock(id, quantity) {
  const equipment = await Equipment.findById(id);
  // Update equipment stock logic if needed
  await equipment.save({ validateBeforeSave: false });
}
