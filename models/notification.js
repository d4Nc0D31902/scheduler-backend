const mongoose = require("mongoose");
const notificationSchema = mongoose.Schema(
  {
    message: {
      type: String,
    },
    status: {
      type: String,
      default: "unread",
    },
    type: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
