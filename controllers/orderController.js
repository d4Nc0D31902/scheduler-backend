const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const Notification = require("../models/notification");

const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

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

    const requesterNotification = new Notification({
      message: `Your Order has been Placed`,
      type: "created",
      user: req.user._id,
    });
    await requesterNotification.save();

    const adminsAndOfficers = await User.find({
      role: { $in: ["admin", "officer"] },
    });
    for (const user of adminsAndOfficers) {
      const adminOfficerNotification = new Notification({
        message: "New Order has been Placed!",
        type: "created",
        user: user._id,
      });
      await adminOfficerNotification.save();
    }

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
      html: `<div class="wrap" style="max-width: 600px; margin: 0 auto;">
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
                <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Order Confirmation</div>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td colspan="2" style="text-align: center; padding: 8px; border: 1px solid #ccc;"><strong>Order Details</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Items</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Quantity</strong></td>
                </tr>
                ${orderItems
                  .map(
                    (item) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
                </tr>`
                  )
                  .join("")}
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Total Price</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${totalPrice}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;"><strong>Payment Method</strong></td>
                  <td style="padding: 8px; border: 1px solid #ccc;">${paymentMeth}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>`,
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

// exports.allOrders = async (req, res, next) => {
//   const orders = await Order.find();
//   // console.log(orders)
//   let totalAmount = 0;
//   orders.forEach((order) => {
//     totalAmount += order.totalPrice;
//   });

//   res.status(200).json({
//     success: true,
//     totalAmount,
//     orders,
//   });
// };

exports.allOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    const updateThreshold = new Date(Date.now() - 60 * 1000);

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;

      if (
        order.createdAt <= updateThreshold &&
        order.orderStatus === "Pending"
      ) {
        order.orderStatus = "Overdued";
        const historyRecord = {
          customer: order.customer,
          orderItems: order.orderItems,
          totalPrice: order.totalPrice,
          orderStatus: "Overdued",
          paymentMeth: order.paymentMeth,
          reference_num: order.reference_num,
          by: "N/A",
          createdAt: order.createdAt,
        };

        order.history.push(historyRecord);
        order.save();
      }
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

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

    await order.save();

    const requesterNotification = new Notification({
      message: `Your Order has been Updated`,
      type: "updated",
      user: order.user,
    });
    await requesterNotification.save();

    order.history.push(historyRecord);
    await order.save();

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
                          <div style="font-size: 14px; color: #800000; margin-bottom: 10px;">Order Confirmation</div>
                      </div>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td colspan="2" style="text-align: center; padding: 8px; border: 1px solid #ccc;"><strong>Order Details</strong></td>
                          </tr>
                          <tr>
                              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Items</strong></td>
                              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Quantity</strong></td>
                          </tr>
                          ${order.orderItems
                            .map(
                              (item) => `
                          <tr>
                              <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
                              <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
                          </tr>`
                            )
                            .join("")}
                          <tr>
                              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Total Price</strong></td>
                              <td style="padding: 8px; border: 1px solid #ccc;">${
                                order.totalPrice
                              }</td>
                          </tr>
                          <tr>
                              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Payment Method</strong></td>
                              <td style="padding: 8px; border: 1px solid #ccc;">${
                                order.paymentMeth
                              }</td>
                          </tr>
                          ${
                            order.paymentMeth === "GCash"
                              ? `
                          <tr>
                              <td style="padding: 8px; border: 1px solid #ccc;"><strong>Reference Number</strong></td>
                              <td style="padding: 8px; border: 1px solid #ccc;">${order.reference_num}</td>
                          </tr>`
                              : ""
                          }
                      </table>
                  </td>
              </tr>
          </table>
      </div>
      `,
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
