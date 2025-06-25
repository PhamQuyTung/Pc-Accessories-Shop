const express = require("express");
const router = express.Router();
const ProductController = require("../app/controllers/productController");
const authMiddleware = require("../app/middlewares/authMiddleware"); // 👈 Thêm dòng này
console.log(
  "🛠️ ProductController.createProduct:",
  ProductController.createProduct
);

// [GET] /api/products => Lấy danh sách
router.get("/", ProductController.getAll);

// [GET] /api/products/create => Trang create (render handlebars)
router.get("/create", ProductController.createProduct);

// [GET] /api/breadcrumb/:slug — phải đặt trước /:slug
router.get("/breadcrumb/:slug", ProductController.getBreadcrumb);

// [POST] /api/products => Thêm sản phẩm mới
router.post("/", ProductController.createProduct);

// [GET] /api/products/related?category=abc&exclude=123
router.get("/related", ProductController.getRelatedProducts);

// [GET] /api/products/:id/reviews => Lấy danh sách đánh giá
router.get("/:id/reviews", ProductController.getReviews);

// [POST] /api/products/:id/reviews => Thêm đánh giá
router.post("/:id/reviews", authMiddleware, ProductController.addReview);

// [GET] /api/products/:slug => Chi tiết theo slug
router.get("/:slug", ProductController.getBySlug);

module.exports = router;
