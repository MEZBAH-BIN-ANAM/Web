const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not admin" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only access this route" });
    }

    const AdminData = await User.findById(decoded.id).select("-password");

    if (!AdminData) {
      return res.status(404).json({ message: "You are not admin" });
    }

    req.user = AdminData;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = adminMiddleware;
