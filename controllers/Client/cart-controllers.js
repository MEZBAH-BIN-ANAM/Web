const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");

const getCartData = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart is empty" });
    }

    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get cart" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;

    // Find user's cart
    let cart = await Cart.findOne({ user: userId });

    // Create new cart if not exists
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity: qty }],
      });

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        cart,
      });
    }

    // Check if product already exists
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    // Increase quantity if exists
    if (existingItem) {
      existingItem.quantity += qty;
    }
    // Otherwise add new product
    else {
      cart.items.push({
        product: productId,
        quantity: qty,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

const deletedCartItemById = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    //if cart not exist
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    //if cart exist
    cart.items = cart.items.filter((item) => {
      return item.product.toString() !== productId;
    });

    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not in cart",
      });
    }

    const cartItem = cart.items[itemIndex];

    // ✅ Increase
    if (quantity === 1) {
      cartItem.quantity += 1;
    }

    // ✅ Decrease
    if (quantity === -1) {
      cartItem.quantity -= 1;
    }

    // ✅ Remove product at 0 or less
    // if (cartItem.quantity <= 0) {
    //   cart.items.splice(itemIndex, 1);
    // }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addToCart,
  getCartData,
  deletedCartItemById,
  updateCartQuantity,
};
