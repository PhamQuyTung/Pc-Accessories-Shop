// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const authMiddleware = require("../app/middlewares/authMiddleware");

router.post("/checkout", authMiddleware, orderController.checkoutOrder);
router.post("/:id/cancel", authMiddleware, orderController.cancelOrder);
router.delete("/:id", authMiddleware, orderController.deleteOrder);
// Lấy đơn hàng của user
router.get("/", authMiddleware, orderController.getUserOrders);

// Lấy danh sách tất cả đơn (admin)
router.get("/all", authMiddleware, orderController.getAllOrders);

// ✅ Lấy chi tiết đơn theo ID
router.get("/:id", authMiddleware, orderController.getOrderById);

// PATCH /api/orders/:id/status
router.patch("/:id/status", authMiddleware, orderController.updateOrderStatus);

// Admin tạo đơn mới
router.post("/admin/create", authMiddleware, orderController.createOrderByAdmin);

module.exports = router;
