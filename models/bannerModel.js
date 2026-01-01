const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        tittle: { type: String, required: true, trim: true },
        subtittle: { type: String, required: true, trim: true },
        link: { type: String, required: true },
        image: { type: String, required: true },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
      { timestamps: true }
);

const Banner=mongoose.model("Banner", bannerSchema);


module.exports = Banner
