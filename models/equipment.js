const mongoose = require("mongoose");

// Define the historySchema
const historySchema = new mongoose.Schema(
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

// Define the stockHistorySchema
const stockHistorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
    by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Define the equipmentSchema
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  history: [historySchema], // Include historySchema as a field
  stockHistory: [stockHistorySchema], // Include stockHistorySchema as a field
});

module.exports = mongoose.model("Equipment", equipmentSchema);
