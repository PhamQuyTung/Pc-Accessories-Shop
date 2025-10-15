// routes/promotionGiftRoutes.js
const router = require("express").Router();
const auth = require("../app/middlewares/authMiddleware");
const PromotionGiftController = require("../app/controllers/promotionGiftController");

// ✅ Danh sách tất cả
router.get("/", auth, PromotionGiftController.list);

// ✅ Thêm mới
router.post("/", auth, PromotionGiftController.create);

// ✅ Cập nhật
router.patch("/:id", auth, PromotionGiftController.update);

// ✅ Xoá
router.delete("/:id", auth, PromotionGiftController.remove);

// ✅ Áp dụng khuyến mãi vào giỏ hàng (frontend CartPage dùng)
router.post("/apply-cart", PromotionGiftController.applyCart);

// ✅ Lấy danh sách khuyến mãi theo productId (frontend ProductDetail dùng) (để cuối cùng)
router.get("/by-product/:productId", PromotionGiftController.byProduct);

module.exports = router;
