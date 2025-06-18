const express = require("express");
const router = express.Router();
const ProductController = require("../app/controllers/productController");

// Route tạo sản phẩm
router.get("/create", ProductController.create);

// Route breadcrumb — phải đặt trước /:slug
router.get("/breadcrumb/:slug", ProductController.getBreadcrumb);

// Lấy tất cả sản phẩm
router.get("/", ProductController.getAll);

// Lấy chi tiết theo slug
router.get("/:slug", ProductController.getBySlug);

module.exports = router;
