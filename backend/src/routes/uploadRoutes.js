// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được upload!" });
  }
  res.json({
    url: `/uploads/${req.file.filename}`, // URL để frontend hiển thị
  });
});

module.exports = router;
