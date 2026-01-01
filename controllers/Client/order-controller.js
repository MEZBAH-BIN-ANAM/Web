const Product= require("../../models/productModel")
const SSLCommerzPayment = require('sslcommerz-lts');
const Cart = require("../../models/cartModel");
const Order = require("../../models/orderModel");

const checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch cart with populated product data
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Calculate total price and items
    let totalProductPrice = 0;
    const items = cart.items.map(item => {
      totalProductPrice += item.quantity * item.product.price;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // Delivery charge logic from your conditions
    const calculateDeliveryCharge = () => {
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      if (totalProductPrice > 30000) return 2000;
      else if (totalProductPrice > 20000) return 1500;
      else if (totalProductPrice > 10000) return 1000;
      else if (totalProductPrice > 5000) return 500;
      else if (itemCount > 5 && totalProductPrice > 2000) return 250;
      else if (itemCount === 5 && totalProductPrice > 1000) return 200;
      else if (itemCount >= 2 && totalProductPrice > 500) return 150;
      else if (itemCount >= 1) return 100;
      return 0;
    };

    const deliveryCharge = calculateDeliveryCharge();
    const totalAmount = totalProductPrice + deliveryCharge;

    // Create the order
    await Order.create({
      user: userId,
      items,
      shippingInfo: req.body.shippingInfo,
      paymentMethod: req.body.paymentMethod || "Cash On Delivery",
      productTotal: totalProductPrice,
      deliveryCharge,
      totalAmount,
      status: "Pending",
    });

    // Clear the cart
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderSummary: {
        productTotal: totalProductPrice,
        deliveryCharge,
        totalAmount
      }
    });

  } catch (err) {
    console.error("Checkout Error:", err);
    return res.status(500).json({ success: false, message: "Checkout failed" });
  }
};


// =====================
// ✅ SSL Payment Init
// =====================
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASS;
const is_live = false; // true in production


const sslInitPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const shippingInfo = req.body.shippingInfo;

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Calculate total
    const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    const deliveryCharge = () => {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalPrice > 30000) return 2000;
      else if (totalPrice > 20000) return 1500;
      else if (totalPrice > 10000) return 1000;
      else if (totalPrice > 5000) return 500;
      else if (count > 5 && totalPrice > 2000) return 250;
      else if (count === 5 && totalPrice > 1000) return 200;
      else if (count >= 2 && totalPrice > 500) return 150;
      else if (count >= 1) return 100;
      else return 0;
    };

    const totalAmount = totalPrice + deliveryCharge();

    // Save pending order in DB
    const order = await Order.create({
      user: userId,
      items: cart.items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
        price: i.product.price,
      })),
      shippingInfo,
      paymentMethod: "SSLCommerz",
      status: "Cancelled",
      totalAmount,
    });

    // Prepare SSLCommerz data
    const data = {
      total_amount: totalAmount,
      currency: "BDT",
      tran_id: "TXN_" + Date.now(),
      success_url: `http://localhost:3000/api/client/order/payment/ssl/success?orderId=${order._id}`,
      fail_url: `http://localhost:3000/api/client/order/payment/ssl/fail`,
      cancel_url: `http://localhost:3000/api/client/order/payment/ssl/cancel`,
      product_name: "Cart Payment",
      product_category: "Ecommerce",
      product_profile: "general",
      cus_name: req.user.name || "Customer",
      cus_email: req.user.email,
      cus_phone: shippingInfo.phone,
      cus_add1: shippingInfo.address,
      cus_city: shippingInfo.city,
      cus_country: "Bangladesh",
      shipping_method: "NO",
      value_a: order._id.toString()

    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    res.json({ success: true, gatewayUrl: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("SSL INIT ERROR:", err);
    res.status(500).json({ success: false, message: "Payment init failed" });
  }
};

// ----------------------
// 2️⃣ SSL SUCCESS
// ----------------------
const sslSuccess = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) return res.redirect(`${process.env.CLIENT}/paymentFail`);

    const order = await Order.findById(orderId);
    if (!order) return res.redirect(`${process.env.CLIENT}/paymentFail`);

    // Update order status
    order.status = "Pending";
    await order.save();

    // Clear cart
    await Cart.updateOne({ user: order.user }, { $set: { items: [] } });

    return res.redirect(`${process.env.CLIENT}/paymentSuccess`);
  } catch (err) {
    console.error("SSL SUCCESS ERROR:", err);
    return res.redirect(`${process.env.CLIENT}/paymentFail`);
  }
};


//ssl failed and cancel controller

const sslFail = async (req, res) => {
  try {
    const orderId = req.body.value_a; // sent in init
    if (orderId) await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });
    return res.redirect(`${process.env.CLIENT}/paymentFail`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${process.env.CLIENT}/paymentFail`);
  }
};

const sslCancel = async (req, res) => {
  try {
    const orderId = req.body.value_a;
    if (orderId) await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });
    return res.redirect(`${process.env.CLIENT}/paymentCancel`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${process.env.CLIENT}/paymentCancel`);
  }
};


const getAllOrdersOfUser = async (req, res, next) => {
  try {
    const userId = req.user._id; // user ID from auth middleware

    const orders = await Order.find({ user: userId })
      .populate("items.product", "tittle price image category")
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Get Orders Error:", error);
    next(error);
  }
};


module.exports = {
  checkout,
  sslInitPayment,
  sslSuccess,
  sslFail,
  sslCancel,
  getAllOrdersOfUser
};
