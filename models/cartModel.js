const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true   // one cart per user
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ]
  },
  { timestamps: true }
);

const Cart=  mongoose.model("cart", cartSchema);

module.exports = Cart;
