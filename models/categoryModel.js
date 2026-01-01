const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    category_name: { type: String, required: true },
    status:{type:String , required:true, default:"inactive"},
    image: { type: String },
  },
  { timestamps: true }
);

const Category=  mongoose.model("category", categorySchema)


module.exports = Category
