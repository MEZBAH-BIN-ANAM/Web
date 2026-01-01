const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please login or register" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;      //attach full user
    req.token = token;   // optional

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      message: "Not authorized, token failed"
    });
  }
};

module.exports = authMiddleware;
