const jwt = require("jsonwebtoken");
const bcrypt= require("bcryptjs");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const Category = require("../../models/categoryModel");
const Banner = require("../../models/bannerModel");
const { default: mongoose } = require("mongoose");
const Contact = require("../../models/contactModel");
const Order = require("../../models/orderModel");
const fs = require("fs");

//auth 
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Check role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 5. Generate token
    const token = user.generateToken()
    // jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "30d" }
    // );

    // 6. Set cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,         // set TRUE in production
      sameSite: "lax",       // set 'none' in production if using cross-site
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Welcome to dashboard",token
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const checkAdmin= async(req,res)=>{
  try {

    res.status(200).json({ success: true, adminData: req.user });

  } catch (error) {
    res.status(500).json({message:error.message})
  }
}

const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//users
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .select({password:0})
      .limit(limit);

    const totalPages= Math.ceil(totalUsers / limit)

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: totalPages ,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById= async(req, res, next)=>{
  try {
    const {id}= req.params;
    const userData= await User.findById({_id:id});
    if(!userData) return res.status(400).json({success: false, message:"User not found"})
    return res.status(200).json({success:true, userData:userData})  
  } catch (error) {
    next(error)
  }
}
const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update only these fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//banner
const addBanner= async(req,res)=>{
  try {
    const {tittle, subtittle,link, status}=req.body;
    if (!tittle || !subtittle || !link) {
      return res.status(400).json({
        success: false,
        message: "Tittle, subtittle and link are required",
      });
    }

    if(!req.file){
      return res.status(400).json({message:"Image is required"})
    }

    const image = req.file.filename;

    //create bannerImage
    const createBanner= await Banner.create({
      tittle,subtittle, link,status, image
    })

    if(!createBanner) return res.status(400).json({success:false, message:"Creating banner error"})
    
      return res.status(200).json({success:true, message:"Banner Create successfull", bannerData:createBanner})
    
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

const getAllBanner=async (req, res) => {
  try {
    const banners = await Banner.find()
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid banner ID" });
    }

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    return res.status(200).json({bannerData:banner});

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteBanner= async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const updateBanner=  async (req, res) => {
  try {
    const { tittle, subtittle, link, status, oldImage } = req.body;

    let updateFields = {
      tittle,
      subtittle,
      link,
      status,
    };

    // New image uploaded → replace and delete old
    if (req.file) {
      updateFields.image = req.file.filename;

      if (oldImage) {
        const oldPath = path.join("upload", oldImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    } else {
      // No new image → keep existing
      updateFields.image = oldImage;
    }

    await Banner.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.status(200).json({ success: true, message: "Banner updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


//products
const getAllProducts = async (req, res) => {
  try {
    // 1️⃣ Read pagination query parameters
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);

    // 2️⃣ Calculate skip value
    const skip = (page - 1) * limit;

    // 3️⃣ Fetch paginated products
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: newest first

    // 4️⃣ Get total product count
    const totalProducts = await Product.countDocuments();

    //total page
    const totalPages=Math.ceil(totalProducts / limit)

    // 5️⃣ Send structured response
    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: totalPages,
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { tittle, brand, description, price, stock, category } = req.body;

    if (!tittle || !brand || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Multer gives uploaded file here
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const image = req.file.filename; // THIS saves file name to DB

    const newProduct = await Product.create({
      tittle,
      brand,
      description,
      price,
      stock,
      category,
      image
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProductById = async(req,res)=>{
  try {
    const {id}= req.params;
    const deleteProduct= await Product.deleteOne({_id:id})
    if(!deleteProduct){  return res.status(400).json({message:"Product not found"})
    }
    return res.status(200).json({message:"Product deleted successfull"})
  
  
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

const getProductById = async(req,res,next)=>{
  try {
    const {id}= req.params;
    const singleProduct= await Product.findById(id);
    if(!singleProduct) return res.status(400).json({success:false, message:"Product not found"})
    return res.status(200).json({success:true , productData:singleProduct})  
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res) => {
  try {
    const { tittle, brand, description, price, stock, category, oldImage } = req.body;

    let updateFields = {
      tittle,
      brand,
      description,
      price,
      stock,
      category,
    };

    // If new image uploaded
    if (req.file) {
      updateFields.image = req.file.filename;

      if (oldImage && fs.existsSync(`upload`)) {
        fs.unlinkSync(`upload`);
      }
    } 
    // No new image: keep old
    else {
      updateFields.image = oldImage;
    }

    await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.status(200).json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
};


//category
const addCategory= async(req,res)=>{
  try {
    const {category_name, status}= req.body;
    if(!category_name || !status){
      return res.status(400).json({
        success: false,
        message: "All field required",
      });
    }

    // Multer gives uploaded file here
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const image = req.file.filename; // THIS saves file name to DB

    const newCategory = await Category.create({
      category_name,
      status,
      image
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category_details: newCategory,
    });
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

const getAllcategory = async (req, res) => {
  try {
    const allCategory = await Category.find();
    res
      .status(200)
      .json(allCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory= async (req, res) => {
  try {
    const banner = await Category.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const getCatergoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Category ID" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, status, oldImage } = req.body;

    let image;

    if (req.file) {
      image = req.file.filename;

      // delete old image
      if (oldImage) {
        const oldPath = path.join("upload", oldImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    } else {
      image = oldImage;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { category_name, status, image },
      { new: true }
    );

    res.status(200).json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//order controllers
const getAllOrders = async (req, res, next) => {
  try {
    // Read page & limit from query params, default values
    const page = parseInt(req.query.page) || 1;      // current page
    const limit = parseInt(req.query.limit) || 1   // items per page
    const skip = (page - 1) * limit;

    // Get total number of orders
    const totalOrders = await Order.countDocuments();

    // Fetch orders with pagination
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // latest orders first
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")        
      .populate("items.product"); 

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrders=   async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    next(error)
  }
}

//message

const getAllMessage = async (req, res, next) => {
  try {
    // 1. Read query params safely
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // 2. Calculate skip value
    const skip = (page - 1) * limit;

    // 3. Fetch messages with pagination
    const allMessages = await Contact.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    // 4. Count total messages (for frontend pagination)
    const totalMessages = await Contact.countDocuments();

    // 5. Response
    return res.status(200).json({
      success: true,
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      allMessages,
    });
  } catch (error) {
    next(error); // handled by errorMiddleware
  }
};

const deleteMessageById= async(req,res,next)=>{
  try {
    const {id}= req.params;
    const deleteMessage= await Contact.findByIdAndDelete(id)
    if(!deleteMessage) return res.status(400).json({success:false, message:"Message not found"});

    return res.status(200).json({success:true, message:"Message deleted successfull"})
  } catch (error) {
    next(error)
  }
}


module.exports = { loginAdmin, logoutAdmin , getAllUsers, deleteUser, getUserById, UpdateUser, getAllProducts, createProduct, deleteProductById, getProductById, updateProduct, getAllcategory, addCategory,deleteCategory, addBanner,getAllBanner, getBannerById, deleteBanner, updateBanner, checkAdmin, getCatergoryById, updateCategory, getAllOrders, updateOrders, getAllMessage, deleteMessageById };
