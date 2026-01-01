const express= require("express");
const { getHomeBanner, getHomeProducts, getHomeCategories } = require("../controllers/Client/home-controllers");
const router= express.Router();


router.route("/banner").get(getHomeBanner)
router.route("/products").get(getHomeProducts)
router.route("/categories").get(getHomeCategories)


module.exports= router;