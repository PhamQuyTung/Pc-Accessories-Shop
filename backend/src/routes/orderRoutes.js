// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// =================== ADMIN ===================
// Lấy danh sách tất cả đơn
router.get("/all", authMiddleware, orderController.getAllOrders);

// Thống kê đơn hàng
router.get("/stats", authMiddleware, orderController.getOrderStats);

// Admin tạo đơn mới
router.post(
  "/admin/create",
  authMiddleware,
  orderController.createOrderByAdmin
);

// Khôi phục đơn hàng đã xóa mềm
router.patch("/:id/restore", authMiddleware, orderController.restoreOrder);

// Xóa vĩnh viễn đơn hàng
router.delete("/:id/force", authMiddleware, orderController.forceDeleteOrder);

// =================== USER ===================
// Checkout tạo đơn mới
router.post("/checkout", authMiddleware, orderController.checkoutOrder);

// Hủy đơn hàng
router.post("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Lấy danh sách đơn của user
router.get("/", authMiddleware, orderController.getUserOrders);

// =================== COMMON (ID) ===================
// Danh sách đơn đã xóa (Trash)
router.get("/trash", authMiddleware, orderController.getDeletedOrders);

// Lấy chi tiết đơn theo ID
router.get("/:id", authMiddleware, orderController.getOrderById);

// Cập nhật trạng thái đơn
router.patch("/:id/status", authMiddleware, orderController.updateOrderStatus);

// Xóa mềm đơn hàng (chuyển vào thùng rác)
router.delete("/:id", authMiddleware, orderController.deleteOrder);

module.exports = router;
