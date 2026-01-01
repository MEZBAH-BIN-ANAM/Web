const express = require("express");
const { addContact } = require("../controllers/Client/contact-controllers");
const router = express.Router();

router.route("/addContact").post(addContact)

module.exports = router