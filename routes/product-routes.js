const express = require("express");
const { getProductById, getAllcategory, getCategoryBaseProduct, getProductsWithPagination, searchProducts, } = require("../controllers/Client/product-controller");
const router = express.Router();

router.route("/products").get(getProductsWithPagination);
router.route("/product/:id").get(getProductById);
router.route("/categories").get( getAllcategory);
router.route("/categories/product/:categoryName").get( getCategoryBaseProduct);
router.route("/products/search").get(searchProducts)



module.exports = router