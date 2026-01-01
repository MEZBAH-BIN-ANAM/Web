const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: Number,
        price: Number,
      },
    ],

    shippingInfo: {
      name: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
    },

    paymentMethod: {
      type: String,
      default: "Cash On Delivery",
    },

    totalAmount: Number,

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

const Order= mongoose.model("Order", orderSchema);


module.exports = Order