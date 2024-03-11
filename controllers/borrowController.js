const Borrowing = require("../models/borrowing");
const Equipment = require("../models/equipment");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const Notification = require("../models/notification");

const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

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

//   // Construct email notification with borrowing information
//   const emailOptions = {
//     email: req.user.email,
//     subject: "Borrowing of Equipment Request",
//     message: `
//       Your borrowing request has been successfully created.

//       Borrowing Information:
//       Borrow Items: ${borrowItems}
//       Borrowing Info: ${borrowingInfo}
//       Date of Return: ${date_return}
//       Issue: ${issue}
//       Status: ${status}
//       Reason for Status: ${reason_status}
//     `,
//     html: `
//       <p>Your borrowing request has been successfully created.</p>
//       <p><strong>Borrowing Information:</strong></p>
//       <p><strong>Borrow Items:</strong> ${borrowItems}</p>
//       <p><strong>Borrowing Info:</strong> ${borrowingInfo}</p>
//       <p><strong>Date of Return:</strong> ${date_return}</p>
//       <p><strong>Issue:</strong> ${issue}</p>
//       <p><strong>Status:</strong> ${status}</p>
//       <p><strong>Reason for Status:</strong> ${reason_status}</p>
//     `,
//   };

//   await sendEmail(emailOptions); // Send email

//   res.status(200).json({
//     success: true,
//     borrowing,
//   });
// };

exports.newBorrowing = async (req, res, next) => {
  const { borrowItems, borrowingInfo, status } = req.body;

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
    status: status || "Pending", // Assign "Pending" if status is undefined
    history: [
      {
        user: userDetail,
        borrowItems,
        status: status || "Pending", // Assign "Pending" if status is undefined
        by: "N/A",
        date_borrow: borrowingInfo.date_borrow,
      },
    ],
  });

  const requesterNotification = new Notification({
    message: `Your Borrowing Equipment has been requested`,
    type: "created",
    user: req.user._id,
  });
  await requesterNotification.save();

  const adminsAndOfficers = await User.find({
    role: { $in: ["admin", "officer"] },
  });
  for (const user of adminsAndOfficers) {
    const adminOfficerNotification = new Notification({
      message: "Borrowing Equipment has been requested",
      type: "created",
      user: user._id,
    });
    await adminOfficerNotification.save();
  }

  // Construct email notification with borrowing information
  const emailOptions = {
    email: req.user.email,
    subject: "Borrowing of Equipment Request",
    message: `
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
                        <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Borrowing of Equipment Request</div>
                        <p style="margin-bottom: 10px;">Your borrowing request has been successfully created.</p>
                    </div>
                </td>
            </tr>
        </table>
        <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #800000; margin-bottom: 20px;">Borrowing Information</h2>

            <hr style="border: 1px solid #ccc; margin: 20px 0;">

            <table style="width: 100%; border-collapse: collapse;">
                <th style="padding: 8px;">Items</th>
                <tr>
                    <th style="border: 1px solid #ccc; padding: 8px;">Name</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Quantity</th>
                </tr>
                ${borrowItems
                  .map(
                    (item) => `
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${item.quantity}</td>
                </tr>
                `
                  )
                  .join("")}
                <tr>
                    <th style="padding: 8px;">Borrowing Info</th>
                    <td style="border: 1px solid #ccc; padding: 8px;">${JSON.stringify(
                      borrowingInfo
                    )}</td>
                </tr>
                <tr>
                    <th style="padding: 8px;">Status</th>
                    <td style="border: 1px solid #ccc; padding: 8px;">${
                      borrowing.status
                    }</td>
                </tr>
            </table>
        </div>
    </div>
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
                    <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Borrowing of Equipment Request</div>
                    <p style="margin-bottom: 10px;">Your borrowing request has been successfully created.</p>
                </div>
            </td>
        </tr>
    </table>
    <div style="background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td colspan="2" style="text-align: center; padding: 8px; border: 1px solid #ccc;"><strong>Borrowing Information</strong></td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ccc;"><strong>Items</strong></td>
                <td style="padding: 8px; border: 1px solid #ccc;"><strong>Quantity</strong></td>
            </tr>
            ${borrowItems
              .map(
                (item) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
            </tr>
            `
              )
              .join("")}
            <tr>
                <td style="padding: 8px; border: 1px solid #ccc;"><strong>Date of Request</strong></td>
                <td style="padding: 8px; border: 1px solid #ccc;">${
                  borrowingInfo.date_borrow
                }</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ccc;"><strong>Reason of Request</strong></td>
                <td style="padding: 8px; border: 1px solid #ccc;">${
                  borrowingInfo.reason_borrow
                }</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ccc;"><strong>Status</strong></td>
                <td style="padding: 8px; border: 1px solid #ccc;">${
                  borrowing.status
                }</td>
            </tr>
        </table>
    </div>
</div>

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

// exports.allBorrowings = async (req, res, next) => {
//   const borrowings = await Borrowing.find();
//   borrowings.forEach((borrowing) => {});
//   res.status(200).json({
//     success: true,
//     borrowings,
//   });
// };

// exports.allBorrowings = async (req, res, next) => {
//   try {
//     const borrowings = await Borrowing.find();
//     const updateThreshold = new Date(Date.now() - 60 * 1000);

//     for (const borrowing of borrowings) {
//       if (
//         borrowing.createdAt <= updateThreshold &&
//         borrowing.status === "Pending"
//       ) {
//         borrowing.status = "Overdued";
//         await borrowing.save();
//       }
//     }

//     res.status(200).json({
//       success: true,
//       borrowings,
//     });
//   } catch (error) {
//     next(error); // Forward the error to the error handler middleware
//   }
// };

exports.allBorrowings = async (req, res, next) => {
  try {
    const borrowings = await Borrowing.find();
    const updateThreshold = new Date(Date.now() - 60 * 1000);

    for (const borrowing of borrowings) {
      if (
        borrowing.createdAt <= updateThreshold &&
        borrowing.status === "Pending"
      ) {
        borrowing.status = "Overdued";
        const historyObj = {
          user: borrowing.user,
          borrowItems: borrowing.borrowItems,
          date_borrow: borrowing.borrowingInfo.date_borrow,
          date_return: null,
          status: "Overdued",
          by: "N/A",
        };
        borrowing.history.push(historyObj);
        await borrowing.save();
      }
    }

    res.status(200).json({
      success: true,
      borrowings,
    });
  } catch (error) {
    next(error);
  }
};

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

    const requesterNotification = new Notification({
      message: `Your Borrowing Request has been Updated`,
      type: "updated",
      user: borrowing.userId,
    });
    await requesterNotification.save();

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
      message: `
        <div class="wrap" style="max-width: 600px; margin: 0 auto;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff" style="border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="padding: 20px;">
                <div style="border-bottom: 2px solid #800000; padding-bottom: 20px;">
                  <div style="font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">Technological University of the Philippines - Taguig City</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Premier State University</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 10px;">14 East Service Road, South Super Highway, Taguig, Metro Manila</div>
                </div>
                <div style="margin-top: 20px;">
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Technological_University_of_the_Philippines_Seal.svg/1200px-Technological_University_of_the_Philippines_Seal.svg.png" alt="Logo" style="width: 100px; height: 100px; margin-right: 20px; float: left;">
                  <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Borrowing of Equipment Update</div>
                  <p style="margin-bottom: 10px;">Your borrowing has been updated.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
      html: `
      <div class="wrap" style="max-width: 600px; margin: 0 auto;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff" style="border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 20px;">
              <div style="border-bottom: 2px solid #800000; padding-bottom: 20px;">
                <div style="font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">Technological University of the Philippines - Taguig City</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Premier State University</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">14 East Service Road, South Super Highway, Taguig, Metro Manila</div>
              </div>
              <div style="margin-top: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Technological_University_of_the_Philippines_Seal.svg/1200px-Technological_University_of_the_Philippines_Seal.svg.png" alt="Logo" style="width: 100px; height: 100px; margin-right: 20px; float: left;">
                <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Borrowing of Equipment Update</div>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td colspan="2" style="text-align: center; padding: 8px; border: 1px solid #ccc;"><strong>Borrowing Information</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Items</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Quantity</strong></td>
                </tr>
                ${borrowing.borrowItems
                  .map(
                    (item) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
                  <td style="padding: 8px; border: 1px solid #ccc;">
                    <div>${item.quantity}</div>
                  </td>
                </tr>`
                  )
                  .join("")}
              <tr>
              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Date Borrowed</strong></td>
              <td style="padding: 8px; border: 1px solid #ccc;">${new Date(
                borrowing.borrowingInfo.date_borrow
              ).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}</td>
            </tr>
            <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Reason Borrowed</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">${
              borrowing.borrowingInfo.reason_borrow
            }</td>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Status</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${
                    borrowing.status
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Date of Return</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${new Date(
                    borrowing.date_return
                  ).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Issue</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${
                    borrowing.issue
                  }</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
      `,
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
