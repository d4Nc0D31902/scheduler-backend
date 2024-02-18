const Product = require("../models/product");
const Order = require("../models/order");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");

//create new product
exports.newProduct = async (req, res, next) => {
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,

      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,

    product,
  });
};

exports.getProducts = async (req, res, next) => {
  const resPerPage = 4;
  const productsCount = await Product.countDocuments();
  // console.log(productsCount,req.query,Product.find())
  // console.log(Product.find().find())
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();

  // const products = await Product.find();
  apiFeatures.pagination(resPerPage);
  const products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  // console.log(products)
  res.status(200).json({
    success: true,
    count: products.length,
    productsCount,
    products,
    filteredProductsCount,
    resPerPage,
  });
};

exports.getSingleProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  // if (!product) {
  // 	return res.status(404).json({
  // 		success: false,
  // 		message: 'Product not found'
  // 	})
  // }
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
};

// exports.updateProduct = async (req, res, next) => {
//   let product = await Product.findById(req.params.id);

//   if (!product) {
//     return next(new ErrorHandler("Product not found", 404));
//   }

//   let images = req.body.images;

//   if (images) {
//     if (typeof images === "string") {
//       images = [images];
//     }

//     for (let i = 0; i < product.images.length; i++) {
//       const result = await cloudinary.v2.uploader.destroy(
//         product.images[i].public_id
//       );
//     }

//     let imagesLinks = [];
//     for (let i = 0; i < images.length; i++) {
//       const result = await cloudinary.v2.uploader.upload(images[i], {
//         folder: "products",
//       });
//       imagesLinks.push({
//         public_id: result.public_id,
//         url: result.secure_url,
//       });
//     }
//     req.body.images = imagesLinks;
//   }

//   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//     useFindandModify: false,
//   });

//   return res.status(200).json({
//     success: true,
//     product,
//   });
// };

// exports.updateProduct = async (req, res, next) => {
//   try {
//     let product = await Product.findById(req.params.id);

//     if (!product) {
//       return next(new ErrorHandler("Product not found", 404));
//     }

//     const oldProduct = { ...product.toObject() };

//     let images = req.body.images;

//     if (images) {
//       if (typeof images === "string") {
//         images = [images];
//       }

//       for (let i = 0; i < product.images.length; i++) {
//         const result = await cloudinary.v2.uploader.destroy(
//           product.images[i].public_id
//         );
//       }

//       let imagesLinks = [];
//       for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//           folder: "products",
//         });
//         imagesLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }
//       req.body.images = imagesLinks;
//     }

//     product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//       useFindandModify: false,
//     });

//     const stockChange = parseInt(req.body.stock) - parseInt(oldProduct.stock);

//     const newStockHistory = {
//       name: oldProduct.name,
//       quantity: Math.abs(stockChange),
//       status: stockChange > 0 ? "Restocked" : "Deducted",
//       by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
//     };

//     product.stockHistory.push(newStockHistory);

//     product.stock = req.body.stock;

//     product.user = req.user._id;

//     product = await product.save();

//     return res.status(200).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const oldProduct = { ...product.toObject() };

    let images = req.body.images;

    if (images) {
      if (typeof images === "string") {
        images = [images];
      }

      for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(
          product.images[i].public_id
        );
      }

      let imagesLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindandModify: false,
    });

    const stockChange = parseInt(req.body.stock) - parseInt(oldProduct.stock);

    if (stockChange > 0) {
      const newStockHistory = {
        name: oldProduct.name,
        quantity: stockChange,
        status: "Restocked",
        by: `${req.user.name} - ${req.user.department}, ${req.user.course}, ${req.user.year}`,
      };

      product.stockHistory.push(newStockHistory);
    }

    product.stock = req.body.stock;
    product.user = req.user._id;

    product = await product.save();

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  // if (!product) {
  // 	return res.status(404).json({
  // 		success: false,
  // 		message: 'Product not found'
  // 	})
  // }

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
};

exports.createProductReview = async (req, res, next) => {
  const { rating, comment, productId, anonymous, date } = req.body;

  let review;
  if (anonymous) {
    review = {
      user: req.user._id,
      name: "Anonymous",
      rating: Number(rating),
      comment,
      date,
    };
  } else {
    review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      date,
    };
  }

  try {
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((reviews) => {
        if (reviews.user.toString() === req.user._id.toString()) {
          reviews.name = review.name;
          reviews.comment = comment;
          reviews.rating = rating;
          reviews.date = date;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in creating product review", 500));
  }
};

exports.getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

exports.getAdminProducts = async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
  });
};

exports.deleteReview = async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  console.log(req);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
};

exports.productSales = async (req, res, next) => {
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$itemsPrice" },
      },
    },
  ]);
  const sales = await Order.aggregate([
    { $project: { _id: 0, orderItems: 1, totalPrice: 1 } },
    { $unwind: "$orderItems" },
    {
      $group: {
        // _id: {month: { $month: "$paidAt" } },
        _id: { product: "$orderItems.name" },
        // total: {$sum: {$multiply: [ "$orderItemsprice", "$orderItemsquantity" ]}}
        total: {
          $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
        },
      },
    },
  ]);

  if (!totalSales) {
    return next(new ErrorHandler("error sales ", 404));
  }
  if (!sales) {
    return next(new ErrorHandler("error sales ", 404));
  }
  let totalPercentage = {};
  totalPercentage = sales.map((item) => {
    console.log(((item.total / totalSales[0].total) * 100).toFixed(2));
    percent = Number(((item.total / totalSales[0].total) * 100).toFixed(2));
    total = {
      name: item._id.product,
      percent,
    };
    return total;
  });
  // return console.log(totalPercentage)
  res.status(200).json({
    success: true,
    totalPercentage,
  });
};

exports.deactivateProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product deactivated",
  });
};

exports.reactivateProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product reactivated",
  });
};
