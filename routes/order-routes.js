const express = require("express");
const authMiddleware = require("../middllewares/auth-middleware");
const { checkout, sslInitPayment, sslSuccess, sslFail, sslCancel, getAllOrdersOfUser } = require("../controllers/Client/order-controller");

const router = express.Router();

router.route("/checkout").post(authMiddleware, checkout);
router.route("/payment/ssl/init").post( authMiddleware, sslInitPayment);
router.route("/payment/ssl/success").post(sslSuccess);
router.route("/payment/ssl/fail").post( sslFail);
router.route("/payment/ssl/cancel").post(sslCancel);

router.route("/my-orders/").get(authMiddleware, getAllOrdersOfUser);



module.exports = router;
