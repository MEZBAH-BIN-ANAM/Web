const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");


const getProductsWithPagination = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    // total count
    const total = await Product.countDocuments();

    // fetch products
    const results = await Product.find({})
      .sort({ createdAt: -1 })   // latest first
      .skip(skip)
      .limit(limit)
      .select("tittle brand price category image");

    res.json({
      page,
      limit,
      total,
      results,
    });
  } catch (error) {
    console.log("PRODUCT LIST ERROR:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
};

const getProductById= async(req,res)=>{
  try {
    const {id}= req.params;
    const singleProduct = await Product.find({_id:id});
    res
      .status(200)
      .json({singleProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


const getAllcategory = async (req, res) => {
  try {
    const allCategory = await Category.find({status:"active"});
    res
      .status(200)
      .json(allCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryBaseProduct = async (req, res, next) => {
  try {
    // 1. Read params & query
    const { categoryName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // 2. Calculate skip
    const skip = (page - 1) * limit;

    // 3. Fetch paginated products
    const products = await Product.find({ category: categoryName })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    // 4. Count total products of this category
    const totalProducts = await Product.countDocuments({
      category: categoryName,
    });

    // 5. Response (same shape as getAllMessage)
    return res.status(200).json({
      success: true,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    next(error); // error middleware
  }
};


const searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 18;
    const skip = (page - 1) * limit;

    // ===== NO SEARCH TEXT =====
    if (!q || q.length===0) {
      const total = await Product.countDocuments();

      const results = await Product.find({})
        .skip(skip)
        .limit(limit)
        .select("tittle brand price category image");

      return res.json({ page, limit, total, results });
    }

    // ===== ATLAS SEARCH =====
    const searchStage = {
      $search: {
        index: "default_1", // SAME INDEX EVERYWHERE
        text: {
          query: q,
          path: ["tittle", "brand", "description", "category"],
          fuzzy: { maxEdits: 2 },
        },
      },
    };

    const results = await Product.aggregate([
      searchStage,
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          tittle: 1,
          brand: 1,
          price: 1,
          category: 1,
          image: 1,
          score: { $meta: "searchScore" },
        },
      },
    ]);

    const totalAgg = await Product.aggregate([
      searchStage,
      { $count: "total" },
    ]);

    const total = totalAgg[0]?.total || 0;

    return res.json({ page, limit, total, results });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};


module.exports = {  getProductsWithPagination, getProductById, getAllcategory, getCategoryBaseProduct, searchProducts};
