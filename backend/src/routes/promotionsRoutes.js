const router = require("express").Router();
const PromotionsController = require("../app/controllers/promotionsController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// Có thể thêm role check: adminOnly

router.get("/", authMiddleware, PromotionsController.list);
router.get("/available-products", authMiddleware, PromotionsController.getAvailableProducts);
router.get("/active", PromotionsController.active);

// ⚡ Quan trọng: Đặt slug trước id
router.get("/slug/:slug/products", PromotionsController.productsBySlug);

// Lấy chi tiết CTKM theo slug
router.get("/slug/:slug", PromotionsController.detailBySlug);

router.get("/:id", authMiddleware, PromotionsController.detail);
router.post("/", authMiddleware, PromotionsController.create);
router.patch("/:id", authMiddleware, PromotionsController.update);
router.delete("/:id", authMiddleware, PromotionsController.remove);

// Gán / gỡ sản phẩm
router.post("/:id/assign-products", authMiddleware, PromotionsController.assignProducts);
router.delete("/:id/unassign-product/:productId", authMiddleware, PromotionsController.unassignProduct);

module.exports = router;
