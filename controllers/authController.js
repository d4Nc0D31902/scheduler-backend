const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

// exports.registerUser = async (req, res, next) => {
//   const result = await cloudinary.uploader.upload(
//     req.body.avatar,
//     {
//       folder: "avatars",
//       width: 150,
//       crop: "scale",
//     },
//     (err, res) => {
//       console.log(err, res);
//     }
//   );
//   const { name, department, course, year, email, password } = req.body;
//   const user = await User.create({
//     name,
//     email,
//     password,
//     department,
//     course,
//     year,
//     avatar: {
//       public_id: result.public_id,
//       url: result.secure_url,
//     },
//   });
//   sendToken(user, 200, res);
// };

exports.registerUser = async (req, res, next) => {
  const { name, department, course, year, email, password } = req.body;

  // Define default values for avatar
  const defaultAvatar = {
    public_id: "avatars/sycaqurx0d18itwbtqcs",
    url: "https://res.cloudinary.com/dxee38clj/image/upload/v1708606343/avatars/sycaqurx0d18itwbtqcs.png",
  };

  // Create the user with default avatar values
  try {
    const user = await User.create({
      name,
      email,
      password,
      department,
      course,
      year,
      avatar: defaultAvatar, // Assign the default avatar object
    });

    sendToken(user, 200, res);
  } catch (error) {
    // Handle error
    console.error("Registration failed:", error);
    // Send response indicating registration failure
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  if (user.status === "inactive") {
    return next(
      new ErrorHandler("Sorry your Account has been Deactivated", 401)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(user, 200, res);
};

exports.logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `https://scheduler-frontend-mu.vercel.app/password/reset/${resetToken}`;

  const message = `<p>Your password reset token is as follow:\n\n<a href="${resetUrl}">Reset Password</a>\n\nIf you have not requested this email, then ignore it.</p>`;

  const html = `<p>Your password reset token is as follow:\n\n<a href="${resetUrl}">Reset Password</a>\n\nIf you have not requested this email, then ignore it.</p>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "TUP-T Scheduler Password Recovery",
      message,
      html,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
};

exports.getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("password");

  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect"));
  }
  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
};

exports.updateProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    department: req.body.department,
    course: req.body.course,
    year: req.body.year,
    availability: req.body.availability,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const image_id = user.avatar.public_id;
    const res = await cloudinary.uploader.destroy(image_id);
    const result = await cloudinary.uploader.upload(
      req.body.avatar,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      },
      (err, res) => {
        console.log(err, res);
      }
    );

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
};

exports.allUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

exports.getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
};

exports.updateUser = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
};

exports.deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
  });
};

// exports.deactivateUser = async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(
//     req.params.id,
//     { status: "inactive" },
//     { new: true }
//   );

//   if (!user) {
//     return next(
//       new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
//     );
//   }

//   res.status(200).json({
//     success: true,
//     message: "User deactivated successfully",
//   });
// };

// exports.reactivateUser = async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(
//     req.params.id,
//     { status: "active" },
//     { new: true }
//   );

//   if (!user) {
//     return next(
//       new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
//     );
//   }

//   res.status(200).json({
//     success: true,
//     message: "User reactivated successfully",
//   });
// };

exports.deactivateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    { new: true }
  );

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // Email notification for deactivation
  const emailOptions = {
    email: user.email,
    subject: "Account Deactivated",
    message: "Your account has been deactivated.",
    html: "<p>Your account has been deactivated.</p>",
  };

  await sendEmail(emailOptions); // Send email

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
  });
};

exports.reactivateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true }
  );

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // Email notification for reactivation
  const emailOptions = {
    email: user.email,
    subject: "Account Reactivated",
    message: "Your account has been reactivated.",
    html: "<p>Your account has been reactivated.</p>",
  };

  await sendEmail(emailOptions); // Send email

  res.status(200).json({
    success: true,
    message: "User reactivated successfully",
  });
};
