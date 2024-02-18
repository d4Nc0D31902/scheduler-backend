const mongoose = require("mongoose");

// Define the historySchema
const historySchema = mongoose.Schema(
  {
    user: {
      type: String,
    },
    borrowItems: [
      {
        name: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
        equipment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Equipment",
        },
      },
    ],
    date_borrow: {
      type: Date,
    },
    date_return: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: "Pending",
    },
    by: {
      type: String,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

// Define the borrowingSchema
const borrowingSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  user: {
    type: String,
    required: true,
  },
  borrowItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      equipment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Equipment",
      },
    },
  ],
  borrowingInfo: {
    date_borrow: {
      type: Date,
      required: true,
    },
    reason_borrow: {
      type: String,
      required: true,
    },
  },
  date_return: {
    type: Date,
    default: null,
  },
  issue: {
    type: String,
    enum: {
      values: [
        "N/A",
        "Damage",
        "Missing",
        "Incorrect Equipment",
        "Dirty or Unhygienic Equipment",
        "Incomplete Sets",
        "Incorrect Use or Mishandling",
        "Stolen or Unreturned Items",
        "Overdue",
      ],
    },
    default: "N/A",
  },
  status: {
    type: String,
    default: "Pending",
  },
  reason_status: {
    type: String,
    default: "N/A",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Reference to historySchema
  history: [historySchema],
});

borrowingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

borrowingSchema.set("toJSON", {
  virtuals: true,
});

const Borrowing = mongoose.model("Borrowing", borrowingSchema);

module.exports = Borrowing; // Exporting the model
