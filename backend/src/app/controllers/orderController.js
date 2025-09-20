const Order = require("../models/order");
const Cart = require("../models/cart");
const { io } = require("../../server"); // 👈 import socket.io từ server.js

exports.checkoutOrder = async (req, res) => {
  const userId = req.userId;
  console.log("📦 Body nhận được:", req.body);

  try {
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select: "name deleted status price discountPrice",
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng đang trống!" });
    }

    const validCartItems = cartItems.filter((item) => {
      const p = item.product_id;
      return (
        p &&
        !p.deleted &&
        Array.isArray(p.status) &&
        !p.status.includes("đã thu hồi")
      );
    });

    if (!validCartItems.length) {
      return res.status(400).json({
        message:
          "Tất cả sản phẩm trong giỏ hàng đã bị thu hồi hoặc không hợp lệ!",
      });
    }

    const orderItems = validCartItems.map((item) => {
      const p = item.product_id;
      return {
        product_id: p._id,
        quantity: item.quantity,
        price: p.discountPrice > 0 ? p.discountPrice : p.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const newOrder = new Order({
      user_id: userId,
      items: orderItems,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      discount: req.body.discount,
      shippingFee: req.body.shippingFee,
      serviceFee: req.body.serviceFee,
      totalAmount: req.body.total || totalAmount,
      finalAmount: req.body.total || totalAmount,
      shippingInfo: req.body.shippingInfo,
      paymentMethod: req.body.paymentMethod,
    });

    await newOrder.save();
    await Cart.deleteMany({ user_id: userId });

    // 👇 Lấy io từ req.app
    const io = req.app.locals.io;
    if (io) {
      io.emit("order:new", newOrder);
    }

    res.status(200).json({
      message: "Đặt hàng thành công!",
      order: newOrder,
    });
  } catch (err) {
    console.error("🔥 Lỗi khi đặt hàng:", err);
    res.status(500).json({ message: "Lỗi khi đặt hàng" });
  }
};

exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.userId;

  try {
    const order = await Order.findOne({ _id: orderId, user_id: userId });
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Đơn hàng đã bị hủy trước đó!" });
    }
    if (order.status === "completed") {
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn hàng đã hoàn thành!" });
    }

    order.status = "cancelled";
    order.cancelReason = req.body.reason || "Không rõ lý do";
    await order.save();

    // 👇 Emit realtime từ app.locals
    const io = req.app.locals.io;
    if (io) io.emit("order:cancelled", order);

    res
      .status(200)
      .json({ message: "Đơn hàng đã được hủy thành công!", order });
  } catch (err) {
    console.error("🔥 Lỗi hủy đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng" });
  }
};

exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.userId;

  try {
    const order = await Order.findOneAndDelete({
      _id: orderId,
      user_id: userId,
    });
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }

    // 👇 Emit realtime từ app.locals
    const io = req.app.locals.io;
    if (io) io.emit("order:deleted", { orderId });

    res.status(200).json({ message: "Đơn hàng đã được xóa thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.userId })
      .populate("items.product_id", "name price discountPrice")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("🔥 Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};
