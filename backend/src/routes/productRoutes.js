const express = require("express");
const router = express.Router();
const ProductController = require("../app/controllers/productController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// 📌 Debug log (có thể bỏ khi production)
console.log("🛠️ ProductController.createProduct:", ProductController.createProduct);

// ─────────────────────────────────────────────────────────────────────────────
// 🔖 Breadcrumb
router.get("/breadcrumb/:slug", ProductController.getBreadcrumb);
router.get("/breadcrumb/category/:slug", ProductController.getCategoryBreadcrumb);

// ─────────────────────────────────────────────────────────────────────────────
// 📦 Product Listing, Search, Filtering
router.get("/", ProductController.getAll);                           // Danh sách sản phẩm
router.get("/search", ProductController.searchProducts);             // Tìm kiếm
router.get("/related", ProductController.getRelatedProducts);        // Sản phẩm liên quan
router.get("/category/:slug", ProductController.getByCategorySlug);  // Theo danh mục

// ─────────────────────────────────────────────────────────────────────────────
// 📋 Product Detail
router.get("/id/:id", ProductController.getById);        // Lấy theo ID
router.get("/:slug", ProductController.getBySlug);       // Lấy theo slug (đặt cuối cùng!)

// ─────────────────────────────────────────────────────────────────────────────
// ➕ Create, 🖊️ Update, 🗑️ Delete
router.post("/", ProductController.createProduct);                // Tạo sản phẩm
router.put("/:id", ProductController.updateProduct);              // Cập nhật
router.delete("/soft/:id", ProductController.softDeleteProduct);  // Xóa tạm
router.delete("/force/:id", ProductController.forceDeleteProduct);// Xóa vĩnh viễn
router.patch("/restore/:id", ProductController.restoreProduct);   // Khôi phục
router.patch("/toggle-visible/:id", ProductController.toggleVisible); // Toggle hiển thị

// ─────────────────────────────────────────────────────────────────────────────
// ✍️ Reviews
router.get("/:id/reviews", ProductController.getReviews);
router.post("/:id/reviews", authMiddleware, ProductController.addReview);

// ─────────────────────────────────────────────────────────────────────────────
// 🛠️ Handlebars Pages (admin CMS views)
router.get("/create", ProductController.createProduct); // Trang tạo
router.get("/edit/:id", ProductController.editProduct); // Trang sửa
router.get("/trash", ProductController.getTrash);       // Danh sách sản phẩm đã xóa

module.exports = router;
