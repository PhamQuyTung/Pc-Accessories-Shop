const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middlewares/authMiddleware");
const variantController = require("../app/controllers/variantController");

// Lấy số lượng biến thể
router.get("/:productId/count", variantController.getVariantCount);

// Route DELETE phải đặt TRƯỚC
router.delete("/:variantId", authMiddleware, variantController.deleteVariant);

// Route update cũng vậy
router.put("/:variantId", authMiddleware, variantController.updateVariant);

// Tạo biến thể (single)
router.post("/:productId/create", authMiddleware, variantController.createVariant);

// CREATE BULK
router.post("/:productId/bulk", authMiddleware, variantController.createBulkVariants);

// ⛔ Đặt CUỐI CÙNG vì nó match quá chung
router.get("/:productId", variantController.getVariantsByProduct);

module.exports = router;
