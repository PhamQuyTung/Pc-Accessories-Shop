const express = require("express");
const router = express.Router();
const ProductController = require("../app/controllers/productController");
console.log('🛠️ ProductController.createProduct:', ProductController.createProduct);

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

// [GET] /api/products/:slug => Chi tiết theo slug
router.get("/:slug", ProductController.getBySlug);

module.exports = router;
