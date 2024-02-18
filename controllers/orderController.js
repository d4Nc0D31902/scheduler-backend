const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");

const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

// Create a new order   =>  /api/v1/order/new
// exports.newOrder = async (req, res, next) => {
//   const {
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     // taxPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//   } = req.body;
//   const order = await Order.create({
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     // taxPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     paidAt: Date.now(),
//     user: req.user._id,
//     customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//   });

//   res.status(200).json({
//     success: true,
//     order,
//   });
// };
// exports.newOrder = async (req, res, next) => {
//   const {
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     reference_num,
//     paymentMeth,
//   } = req.body;

//   const order = await Order.create({
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     paidAt: Date.now(),
//     user: req.user._id,
//     customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     reference_num,
//     paymentMeth,
//     orderStatus: "Pending",
//   });

//   res.status(200).json({
//     success: true,
//     order,
//   });
// };

// exports.newOrder = async (req, res, next) => {
//   const {
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     reference_num,
//     paymentMeth,
//   } = req.body;

//   try {
//     // Create new order
//     const order = await Order.create({
//       orderItems,
//       shippingInfo,
//       itemsPrice,
//       shippingPrice,
//       totalPrice,
//       paymentInfo,
//       paidAt: Date.now(),
//       user: req.user._id,
//       customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       reference_num,
//       paymentMeth,
//       orderStatus: "Pending",
//       history: [
//         {
//           // Create new history record within the order
//           customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//           orderItems,
//           totalPrice,
//           orderStatus: "Pending",
//           paymentMeth,
//           reference_num,
//           by: "N/A",
//           createdAt: Date.now(),
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// exports.newOrder = async (req, res, next) => {
//   const {
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     reference_num,
//     paymentMeth,
//     screenShot,
//   } = req.body;

//   try {
//     let screenShotLinks = [];

//     if (screenShot && screenShot.length > 0) {
//       for (let i = 0; i < screenShot.length; i++) {
//         const result = await cloudinary.uploader.upload(screenShot[i], {
//           folder: "orders",
//         });

//         screenShotLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }
//     }

//     const order = await Order.create({
//       orderItems,
//       shippingInfo,
//       itemsPrice,
//       shippingPrice,
//       totalPrice,
//       paymentInfo,
//       screenShot: screenShotLinks,
//       paidAt: Date.now(),
//       user: req.user._id,
//       customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       reference_num,
//       paymentMeth,
//       orderStatus: "Pending",
//       history: [
//         {
//           customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//           orderItems,
//           totalPrice,
//           orderStatus: "Pending",
//           paymentMeth,
//           reference_num,
//           by: "N/A",
//           createdAt: Date.now(),
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

exports.newOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    reference_num,
    paymentMeth,
    screenShot,
  } = req.body;

  try {
    let screenShotLinks = [];

    if (screenShot && screenShot.length > 0) {
      for (let i = 0; i < screenShot.length; i++) {
        const result = await cloudinary.uploader.upload(screenShot[i], {
          folder: "orders",
        });

        screenShotLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      screenShot: screenShotLinks,
      paidAt: Date.now(),
      user: req.user._id,
      customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
      reference_num,
      paymentMeth,
      orderStatus: "Pending",
      history: [
        {
          customer: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
          orderItems,
          totalPrice,
          orderStatus: "Pending",
          paymentMeth,
          reference_num,
          by: "N/A",
          createdAt: Date.now(),
        },
      ],
    });

    // Fetch user's email from the User model
    // const user = await User.findById(req.user._id);
    // if (!user) {
    //   return next(new ErrorHandler("User not found", 404));
    // }
    // const userEmail = user.email;

    // Construct email notification for new order
    const emailOptions = {
      email: req.user.email,
      subject: "New Order",
      message:
        `Your order with reference number ${reference_num} has been successfully placed.\n\n` +
        `Order Details:\n` +
        `Items: ${orderItems
          .map((item) => `${item.name} - ${item.quantity}`)
          .join("\n")}\n` +
        `Shipping Info: ${JSON.stringify(shippingInfo)}\n` +
        `Total Price: ${totalPrice}\n` +
        `Payment Method: ${paymentMeth}\n`,
      html:
        `<p>Your order with reference number ${reference_num} has been successfully placed.</p>` +
        `<p><strong>Order Details:</strong></p>` +
        `<p><strong>Items:</strong><br>${orderItems
          .map((item) => `${item.name} - ${item.quantity}`)
          .join("<br>")}</p>` +
        `<p><strong>Shipping Info:</strong><br>${JSON.stringify(
          shippingInfo
        )}</p>` +
        `<p><strong>Total Price:</strong> ${totalPrice}</p>` +
        `<p><strong>Payment Method:</strong> ${paymentMeth}</p>`,
    };

    // Send email notification
    await sendEmail(emailOptions);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getSingleOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
};

exports.myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  // console.log(req.user)
  res.status(200).json({
    success: true,
    orders,
  });
};

exports.allOrders = async (req, res, next) => {
  const orders = await Order.find();
  // console.log(orders)
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
};

// exports.updateOrder = async (req, res, next) => {
//   const order = await Order.findById(req.params.id);
//   if (order.orderStatus === "Delivered") {
//     return next(new ErrorHandler("You have already delivered this order", 400));
//   }
//   order.orderItems.forEach(async (item) => {
//     await updateStock(item.product, item.quantity);
//   });
//   order.orderStatus = req.body.status;
//   order.deliveredAt = Date.now();
//   await order.save();
//   res.status(200).json({
//     success: true,
//   });
// };

// exports.updateOrder = async (req, res, next) => {
//   const order = await Order.findById(req.params.id);
//   if (order.orderStatus === "Delivered") {
//     return next(new ErrorHandler("You have already delivered this order", 400));
//   }
//   order.orderItems.forEach(async (item) => {
//     await updateStock(item.product, item.quantity, req.user);
//   });
//   order.orderStatus = req.body.status;
//   order.deliveredAt = Date.now();
//   await order.save();
//   res.status(200).json({
//     success: true,
//   });
// };

// exports.updateOrder = async (req, res, next) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return next(new ErrorHandler("Order not found", 404));
//     }

//     // Create history record based on the current order details
//     const historyRecord = {
//       customer: order.customer,
//       orderItems: order.orderItems,
//       totalPrice: order.totalPrice,
//       orderStatus: req.body.status,
//       paymentMeth: order.paymentMeth,
//       reference_num: order.reference_num,
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//       createdAt: order.createdAt,
//     };
//     order.orderItems.forEach(async (item) => {
//       await updateStock(item.product, item.quantity, req.user);
//     });

//     order.orderStatus = req.body.status;
//     if (req.body.status === "Sold") {
//       order.deliveredAt = Date.now();
//     }

//     // Save the updated order
//     await order.save();

//     // Add the history record to the order's history array
//     order.history.push(historyRecord);
//     await order.save();

//     res.status(200).json({
//       success: true,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Create history record based on the current order details
    const historyRecord = {
      customer: order.customer,
      orderItems: order.orderItems,
      totalPrice: order.totalPrice,
      orderStatus: req.body.status,
      paymentMeth: order.paymentMeth,
      reference_num: order.reference_num,
      by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
      createdAt: order.createdAt,
    };
    order.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity, req.user);
    });

    order.orderStatus = req.body.status;
    if (req.body.status === "Sold") {
      order.deliveredAt = Date.now();
    }

    // Save the updated order
    await order.save();

    // Add the history record to the order's history array
    order.history.push(historyRecord);
    await order.save();

    // Fetch user's email from the User model
    const user = await User.findById(order.user);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const userEmail = user.email;

    // Construct email notification for order update
    const emailOptions = {
      email: userEmail,
      subject: "Order Update",
      message: `Your order with reference number ${order.reference_num} has been updated to ${req.body.status}.`,
      html: `<p>Your order with reference number ${order.reference_num} has been updated to ${req.body.status}.</p>`,
    };

    // Send email notification
    await sendEmail(emailOptions);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

async function updateStock(id, quantity, user) {
  const product = await Product.findById(id);
  const oldStock = product.stock;
  product.stock -= quantity;

  const order = await Order.findOne({ "orderItems.product": id });
  const paymentStatus = order.orderStatus;

  const stockHistory = {
    name: product.name,
    quantity: quantity,
    status: paymentStatus,
    by: `${user.name} - ${user.department}, ${user.course}, ${user.year}`,
  };
  product.stockHistory.push(stockHistory);

  await product.save({ validateBeforeSave: false });
}

exports.deleteOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
};

exports.totalOrders = async (req, res, next) => {
  const totalOrders = await Order.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);
  if (!totalOrders) {
    return next(new ErrorHandler("error total orders", 404));
  }
  res.status(200).json({
    success: true,
    totalOrders,
  });
};

exports.totalSales = async (req, res, next) => {
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);
  if (!totalSales) {
    return next(new ErrorHandler("error total saless", 404));
  }
  res.status(200).json({
    success: true,
    totalSales,
  });
};

exports.customerSales = async (req, res, next) => {
  const customerSales = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    // {
    //     $group: {
    //        _id: "$user",
    //        total: { $sum: "$totalPrice" },

    //     }
    //   },

    { $unwind: "$userDetails" },

    {
      $group: {
        _id: "$user",
        total: { $sum: "$totalPrice" },
        doc: { $first: "$$ROOT" },
      },
    },

    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ total: "$total" }, "$doc"] },
      },
    },
    // {
    //     $group: {
    //         _id: "$userDetails.name",
    //         total: { $sum: "$totalPrice" }
    //     }
    // },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        "userDetails.name": 1,
        total: 1,
      },
    },
  ]);
  if (!customerSales) {
    return next(new ErrorHandler("error customer sales", 404));
  }
  // return console.log(customerSales)
  res.status(200).json({
    success: true,
    customerSales,
  });
};

exports.salesPerMonth = async (req, res, next) => {
  const salesPerMonth = await Order.aggregate([
    {
      $group: {
        // _id: {month: { $month: "$paidAt" } },
        _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
        total: { $sum: "$totalPrice" },
      },
    },

    {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: [
                ,
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                " Sept",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
            in: {
              $arrayElemAt: ["$$monthsInString", "$_id.month"],
            },
          },
        },
      },
    },
    { $sort: { "_id.month": 1 } },
    {
      $project: {
        _id: 1,
        month: 1,

        total: 1,
      },
    },
  ]);
  if (!salesPerMonth) {
    return next(new ErrorHandler("error sales per month", 404));
  }
  // return console.log(customerSales)
  res.status(200).json({
    success: true,
    salesPerMonth,
  });
};

// async function updateStock(id, quantity) {
//   const product = await Product.findById(id);
//   product.stock = product.stock - quantity;
//   await product.save({ validateBeforeSave: false });
// }
