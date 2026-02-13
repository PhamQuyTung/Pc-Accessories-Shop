const express = require("express");
const router = express.Router();
const accountController = require("../app/controllers/accountController");
const authMiddleware = require("../app/middlewares/authMiddleware");
const { uploadAvatar } = require("../utils/multer");

// Lấy danh sách tất cả accounts
router.get("/", accountController.getAllAccounts);

// Thông tin user hiện tại
router.get("/me", authMiddleware, accountController.getMe);

// Cập nhật thông tin user (không bao gồm file)
router.put("/update", authMiddleware, accountController.updateAccount);

// ========== RECENTLY VIEWED ==========
router.post(
  "/me/recently-viewed",
  authMiddleware,
  accountController.addRecentlyViewed,
);

router.get(
  "/me/recently-viewed",
  authMiddleware,
  accountController.getRecentlyViewed,
);

// Upload avatar (multipart/form-data)
router.post(
  "/me/avatar",
  authMiddleware,
  (req, res, next) => {
    uploadAvatar(req, res, function (err) {
      if (err) {
        console.error(err);
        return res
          .status(400)
          .json({ message: err.message || "Upload avatar lỗi" });
      }
      next();
    });
  },
  accountController.uploadAvatar,
);

module.exports = router;
