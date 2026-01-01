const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    tittle: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0,},
    category: { type: String, required: true },
    image: { type: String },
    rating: { type: Number, default: 4, max:5 }

    // reviews: [
    //   {
    //     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     comment: String,
    //     rating: Number,
    //     createdAt: { type: Date, default: Date.now },
    //   },
    // ],
  },
  { timestamps: true }
);

const Product=  mongoose.model("product", productSchema)


module.exports = Product
