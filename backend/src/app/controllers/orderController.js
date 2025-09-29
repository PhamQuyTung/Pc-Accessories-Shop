const mongoose = require("mongoose");
const Order = require("../models/order");
const orderService = require("../services/orderService");

const populateFields = "name slug price discountPrice images status deleted";

function emitEvent(req, event, payload) {
  const io = req.app.locals.io;
  if (io) io.emit(event, payload);
}

// === Controllers ===

// Checkout
exports.checkoutOrder = async (req, res) => {
  const userId = req.userId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newOrderDoc = await orderService.checkoutOrder(
      userId,
      req.body,
      session
    );
    await session.commitTransaction();
    session.endSession();

    const order = await Order.findById(newOrderDoc._id).populate(
      "items.product_id",
      populateFields
    );

    emitEvent(req, "order:new", { order });
    res.status(200).json({ message: "Đặt hàng thành công!", order });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.message === "EMPTY_CART")
      return res.status(400).json({ message: "Giỏ hàng đang trống!" });
    if (err.message === "INVALID_CART_ITEMS")
      return res.status(400).json({
        message:
          "Tất cả sản phẩm trong giỏ hàng đã bị thu hồi hoặc không hợp lệ!",
      });
    if (err.message.startsWith("OUT_OF_STOCK")) {
      const [, productName, requested, available] = err.message.split(":");
      return res.status(400).json({
        message: `Sản phẩm "${productName}" chỉ còn ${available} cái, bạn đã đặt ${requested}. Vui lòng giảm số lượng.`,
        product: productName,
        requested: Number(requested),
        available: Number(available),
      });
    }

    console.error("🔥 Lỗi khi đặt hàng:", err);
    res.status(500).json({ message: "Lỗi khi đặt hàng" });
  }
};

// Cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.id,
      req.userId,
      req.body.reason
    );
    emitEvent(req, "order:cancelled", { order });
    res.status(200).json({ message: "Đơn hàng đã được hủy!", order });
  } catch (err) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    if (err.message === "CANNOT_CANCEL")
      return res.status(400).json({ message: "Đơn hàng không thể hủy!" });
    console.error("🔥 Lỗi hủy đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng" });
  }
};

// Delete (soft)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await orderService.deleteOrder(req.params.id, req.userId);

    // Populate lại cho chắc (nếu frontend cần dùng)
    const populatedOrder = await Order.findById(order._id).populate(
      "items.product_id",
      populateFields
    );

    emitEvent(req, "order:deleted", { orderId: order._id });
    res.status(200).json({
      message: "Đơn hàng đã bị xóa!",
      order: populatedOrder, // 👈 trả về đầy đủ + status = deleted
    });
  } catch (err) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    console.error("🔥 Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};

// Lấy đơn hàng user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.userId);
    res.status(200).json({ orders });
  } catch (err) {
    console.error("🔥 Lỗi lấy orders:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng" });
  }
};

// Lấy tất cả đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ orders });
  } catch (err) {
    console.error("🔥 Lỗi lấy all orders:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng" });
  }
};

// Lấy chi tiết đơn
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    res.status(200).json({ order });
  } catch (err) {
    console.error("🔥 Lỗi get order:", err);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
};

// Update status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Admin tạo đơn
exports.createOrderByAdmin = async (req, res) => {
  try {
    const order = await orderService.createOrderByAdmin(req.body, req.userId);
    emitEvent(req, "order:new", { order });
    res.status(201).json({ message: "Tạo đơn hàng thành công!", order });
  } catch (err) {
    if (err.message === "NO_ITEMS")
      return res
        .status(400)
        .json({ message: "Đơn hàng phải có ít nhất 1 sản phẩm!" });
    console.error("🔥 Lỗi tạo đơn hàng admin:", err);
    res.status(500).json({ message: "Lỗi khi admin tạo đơn hàng" });
  }
};

// Thống kê
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json(stats);
  } catch (err) {
    console.error("🔥 Lỗi thống kê:", err);
    res.status(500).json({ message: "Lỗi khi thống kê đơn hàng" });
  }
};

// Khôi phục đơn
exports.restoreOrder = async (req, res) => {
  try {
    const order = await orderService.restoreOrder(req.params.id);
    res.json({ message: "Đơn hàng đã được khôi phục!", order });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    if (err.message.startsWith("OUT_OF_STOCK")) {
      return res
        .status(400)
        .json({ message: "Sản phẩm trong đơn đã hết hàng!" });
    }
    res.status(500).json({ message: "Lỗi khi khôi phục đơn hàng" });
  }
};

// Xóa vĩnh viễn
exports.forceDeleteOrder = async (req, res) => {
  try {
    await orderService.forceDeleteOrder(req.params.id);
    res.json({ message: "Đơn hàng đã bị xóa vĩnh viễn!" });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    res.status(500).json({ message: "Lỗi khi xóa vĩnh viễn đơn hàng" });
  }
};

// Lấy đơn đã xóa mềm
exports.getDeletedOrders = async (req, res) => {
  try {
    const orders = await orderService.getDeletedOrders();
    res.status(200).json({ orders });
  } catch (err) {
    console.error("🔥 Lỗi lấy deleted orders:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn đã xóa" });
  }
};
