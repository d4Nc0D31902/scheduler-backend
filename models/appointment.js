const mongoose = require("mongoose");

const historySchema = mongoose.Schema(
  {
    schedTitle: {
      type: String,
      required: true,
    },
    requester: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timeStart: {
      type: Date,
      required: true,
    },
    timeEnd: {
      type: Date,
      required: true,
    },
    professor: {
      type: String,
      default: "N/A",
    },
    status: {
      type: String,
      required: true,
    },
    by: {
      type: String,
      required: true,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

const appointmentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    requester: {
      type: String,
      required: true,
    },
    attendees: {
      type: [String],
      required: true,
      default: "N/A",
    },
    location: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timeStart: {
      type: Date,
      required: true,
    },
    timeEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    professor: {
      type: String,
      default: "N/A",
    },
    reason: {
      type: String,
      default: "N/A",
    },
    key: {
      type: String,
      maxlength: [6],
      default: " ",
    },
    screenShot: [
      {
        public_id: String,
        url: String,
      },
    ],
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
