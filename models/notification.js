const mongoose = require("mongoose");
const notificationSchema = mongoose.Schema(
  {
    message: {
      type: String,
    },
    status: {
      type: String,
      default:"unread"
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
