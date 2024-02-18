const mongoose = require("mongoose");

const historySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    by: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const sportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sport", sportSchema);
