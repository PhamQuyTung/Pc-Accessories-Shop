const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middlewares/authMiddleware");
const variantController = require("../app/controllers/variantController");

// Lấy số lượng biến thể
// Path: /api/variants/:productId/count
router.get("/:productId/count", variantController.getVariantCount);

// Route DELETE phải đặt TRƯỚC
// Xóa biến thể
router.delete("/:variantId", authMiddleware, variantController.deleteVariant);

// Route update cũng vậy
// Cập nhật biến thể
router.put("/:variantId", authMiddleware, variantController.updateVariant);

// 🟦 Chỉ cập nhật mô tả biến thể
router.patch(
  "/:variantId/description",
  authMiddleware,
  variantController.updateVariantDescription
);

// 🟩 Chỉ tạo mới mô tả (khi biến thể chưa có)
router.post(
  "/:variantId/description",
  authMiddleware,
  variantController.createVariantDescription
);

// Tạo biến thể (single)
// Path: /api/variants/:productId/create
router.post("/:productId/create", authMiddleware, variantController.createVariant);

// CREATE BULK
// Path: /api/variants/:productId/bulk
router.post("/:productId/bulk", authMiddleware, variantController.createBulkVariants);

// Đặt default variant
// Path: /api/variants/:productId/:variantId/default
router.patch("/:productId/:variantId/default", authMiddleware, variantController.setDefaultVariant);

// ⛔ Đặt CUỐI CÙNG vì nó match quá chung
// Lấy biến thể theo productId
router.get("/:productId", variantController.getVariantsByProduct);

module.exports = router;
