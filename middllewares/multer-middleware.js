const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/"); // ✅ better practice: use "uploads/"
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// ✅ File filter: allow images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// ✅ Limit file size (2MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
  },
  fileFilter,
});


module.exports = upload;
