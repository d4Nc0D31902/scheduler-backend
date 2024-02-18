const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
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
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
