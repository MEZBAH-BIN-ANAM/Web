const express= require("express");
const { register, login, user, LogoutUser } = require("../controllers/Client/auth-controller");
const authMiddleware = require("../middllewares/auth-middleware");
const router= express.Router();

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/user").get(authMiddleware, user)
router.route("/logout").post(LogoutUser);
  





module.exports= router;