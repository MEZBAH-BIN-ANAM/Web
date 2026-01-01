const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");

const register = async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user (password is hashed in schema)
    const newUser = await User.create({ username, email, password, address });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        address: newUser.address,
      }
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "Enter correct email", status: false });
    }

    // Validate password
    const isValid = await bcrypt.compare(password, userExist.password);
    if (!isValid) {
      return res.status(400).json({ message: "Enter correct password", status: false });
    }
    const token= userExist.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,        // true in production 
      sameSite: "lax",       // set 'none' in production if using cross-site
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Login successful
    return res.status(200).json({ message: "Login successful", status: true, token });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const user= async(req,res)=>{
  try {

    res.status(200).json({ success: true, user: req.user });

  } catch (error) {
    res.status(500).json({message:error.message})
  }
}

const LogoutUser= (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}


module.exports = { register, login , user, LogoutUser};
