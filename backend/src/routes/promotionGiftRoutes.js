// routes/promotionGiftRoutes.js
const router = require("express").Router();
const auth = require("../app/middlewares/authMiddleware");
const PromotionGiftController = require("../app/controllers/promotionGiftController");

// ✅ Danh sách tất cả
router.get("/", auth, PromotionGiftController.list);

// ✅ Thêm mới
router.post("/", auth, PromotionGiftController.create);

// ✅ Xoá
router.delete("/:id", auth, PromotionGiftController.remove);

// ✅ Lấy danh sách khuyến mãi theo productId (frontend ProductDetail dùng)
router.get("/by-product/:productId", PromotionGiftController.byProduct);

module.exports = router;
