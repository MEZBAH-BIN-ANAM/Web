const Banner = require("../../models/bannerModel");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");

const getHomeBanner = async (req, res) => {
    try {
      const allBanner = await Banner.find({ status: "active" });
  
      if (!allBanner || allBanner.length === 0) {
        return res.status(404).json({success: false,  message: "No active banners found" });
      }
  
      return res.status(200).json( allBanner );
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  


const getHomeProducts= async(req,res)=>{
  try {
    const limit = parseInt(req.query.limit) || 24;

    const products = await Product.find()
      .limit(limit);

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const getHomeCategories= async(req,res)=>{
  try {
    const limit = parseInt(req.query.limit) || 10; 

    const categories = await Category.find({status:"active"})
      .limit(limit);

    res.status(200).json(categories);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { getHomeBanner, getHomeProducts, getHomeCategories }