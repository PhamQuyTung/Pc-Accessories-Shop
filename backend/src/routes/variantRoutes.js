const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middlewares/authMiddleware");
const variantController = require("../app/controllers/variantController");

// Lấy số lượng biến thể
router.get("/:productId/count", variantController.getVariantCount);

// Lấy danh sách biến thể của 1 sản phẩm
router.get("/:productId", variantController.getVariantsByProduct);

// // Tạo biến thể (single)
// router.post("/:productId", authMiddleware, variantController.createVariant);

// Tạo biến thể (endpoint khác - match frontend path)
router.post("/:productId/create", authMiddleware, variantController.createVariant);

// Tạo bulk biến thể
router.post("/:productId/bulk", authMiddleware, variantController.createBulkVariants);

// Xóa biến thể
router.delete("/:variantId", authMiddleware, variantController.deleteVariant);

// Cập nhật biến thể
router.put("/:variantId", authMiddleware, variantController.updateVariant);

module.exports = router;
