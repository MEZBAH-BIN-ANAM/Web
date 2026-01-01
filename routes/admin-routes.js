const upload = require("../middllewares/multer-middleware");
const express = require("express");
const router = express.Router();
const { loginAdmin, getAllProducts, createProduct, deleteProductById, addCategory, getAllcategory, addBanner, getAllBanner, deleteBanner, deleteCategory, logoutAdmin, checkAdmin, getAllUsers, getBannerById, getCatergoryById, updateCategory, getAllMessage, getAllOrders, updateOrders, UpdateUser, getUserById, deleteUser, getProductById, updateProduct, deleteMessageById, updateBanner } = require("../controllers/admin/admin-controllers");
const adminMiddleware = require("../middllewares/admin-middleware");


// all auth routes
router.route("/login").post( loginAdmin);
router.route("/logout").post(logoutAdmin);
router.route("/adminData").get(adminMiddleware, checkAdmin)

//all user routes
router.route("/users").get(getAllUsers)
router.route("/user/:id").get(getUserById)
router.route("/updateUser/:id").put( UpdateUser );
router.route("/delete/:id").delete( deleteUser );


// all banner routes
router.route("/addBanner").post(upload.single("image") , addBanner);
router.route("/getBanner").get( getAllBanner);
router.route("/getBanner/:id").get(getBannerById)
router.route("/deleteBanner/:id").delete(deleteBanner)
router.route("/updateBanner/:id").put(upload.single("image"), updateBanner);



// all product routes
router.route("/product").get( getAllProducts);
router.route("/product/:id").get( getProductById);
router.route("/product").post(upload.single("image") , createProduct);
router.route("/deleteProduct/:id").delete( deleteProductById );
router.route("/updateProduct/:id").put (upload.single("image") ,updateProduct);



// all category routes
router.route("/category").get( getAllcategory);
router.route("/getCategory/:id").get(getCatergoryById)
router.route("/category").post(upload.single("image"), addCategory);
router.route("/deleteCategory/:id").delete(deleteCategory)
router.route("/updateCategory/:id").put( upload.single("image"), updateCategory )


//all orders routes
router.route("/orders").get( getAllOrders);
router.route("/order/:orderId").put( updateOrders);


//all messages routes
router.route("/messages").get( getAllMessage);
router.route("/deleteMessage/:id").delete( deleteMessageById);

// router.post("/upload", upload.single("image"),  (req, res) => {
//     res.json({ file: req.file });
//   });
  
  

module.exports = router