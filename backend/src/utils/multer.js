const multer = require("multer");
const path = require("path");
const fs = require("fs");

const AVATAR_FOLDER = path.join(__dirname, "../uploads/avatars");

// đảm bảo folder tồn tại
if (!fs.existsSync(AVATAR_FOLDER)) {
  fs.mkdirSync(AVATAR_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_FOLDER);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // .png, .jpg
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("File ảnh không hợp lệ"), false);
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("avatar"); // field name = avatar

module.exports = { uploadAvatar, AVATAR_FOLDER };
