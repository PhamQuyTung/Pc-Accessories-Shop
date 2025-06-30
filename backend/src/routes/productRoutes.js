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
// [GET] /api/products/related?category=abc&exclude=123
router.get("/related", ProductController.getRelatedProducts);
// [POST] /api/products => Thêm sản phẩm mới
router.post("/", ProductController.createProduct);

// [GET] /api/products/:id => Lấy chi tiết sản phẩm theo id (JSON)
router.get("/id/:id", ProductController.getById);
// [PUT] /api/products/:id => Cập nhật sản phẩm
router.put("/:id", ProductController.updateProduct);

// [GET] /api/products/:id/reviews => Lấy danh sách đánh giá
router.get("/:id/reviews", ProductController.getReviews);
// [POST] /api/products/:id/reviews => Thêm đánh giá
router.post("/:id/reviews", authMiddleware, ProductController.addReview);

// [GET] /:id/edit => Trang edit 
router.get("/edit/:id", ProductController.editProduct);

// [DELETE] /api/products/:id => Xóa sản phẩm
router.delete("/soft/:id", ProductController.softDeleteProduct); // Xóa tạm thời

// [GET] /api/products/trash => Lấy danh sách sản phẩm đã xóa tạm thời
router.get("/trash", ProductController.getTrash); // Lấy danh sách thùng rác

// [GET] /api/products/trash/:id => Lấy chi tiết sản phẩm đã xóa tạm thời
router.delete("/force/:id", ProductController.forceDeleteProduct); // Xóa vĩnh viễn

// [PATCH] /api/products/restore/:id => Khôi phục sản phẩm đã xóa tạm thời
router.patch("/restore/:id", ProductController.restoreProduct);

// [GET] /api/products/:slug => Chi tiết theo slug
router.get("/:slug", ProductController.getBySlug);

module.exports = router;
