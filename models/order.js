const mongoose = require("mongoose");

const historySchema = mongoose.Schema(
  {
    customer: {
      type: String,
    },
    orderItems: [
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
        price: {
          type: Number,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    paymentMeth: {
      type: String,
    },
    reference_num: {
      type: String,
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

const orderSchema = mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  customer: {
    type: String,
    required: true,
  },
  orderItems: [
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
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  screenShot: [
    {
      public_id: String,
      url: String,
    },
  ],
  paidAt: {
    type: Date,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  // taxPrice: {
  //   type: Number,
  //   required: true,
  //   default: 0.0,
  // },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  reference_num: {
    type: String,
    // required: true,
    maxlength: 13, // Limit to 13 characters
    validate: {
      validator: function (v) {
        return true;
      },
      message: (props) => `${props.value} is not a valid reference number!`,
    },
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Pending",
  },
  paymentMeth: {
    type: String,
    required: true,
  },
  deliveredAt: {
    type: Date,
  },
  history: [historySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
