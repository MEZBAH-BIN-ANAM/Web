const express = require("express");
const authMiddleware = require("../middllewares/auth-middleware");
const { addToCart, getCartData, deletedCartItemById, updateCartQuantity } = require("../controllers/Client/cart-controllers");

const router = express.Router();

router.route("/cartData").get( authMiddleware, getCartData);
router.route("/add").post( authMiddleware, addToCart);
router.route("/removeCartItem/:id").delete(authMiddleware, deletedCartItemById)
router.route("/update").put(authMiddleware, updateCartQuantity)

module.exports = router;
