const Order = require("../models/order");
const Cart = require("../models/cart");

exports.checkoutOrder = async (req, res) => {
  const userId = req.userId;

  try {
    const cartItems = await Cart.find({ user_id: userId }).populate(
      "product_id"
    );

    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng đang trống!" });
    }

    const orderItems = cartItems.map((item) => ({
      product_id: item.product_id._id,
      quantity: item.quantity,
      price:
        item.product_id.discountPrice > 0
          ? item.product_id.discountPrice
          : item.product_id.price,
    }));

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    const newOrder = new Order({
      user_id: userId,
      items: orderItems,
      totalAmount,
      shippingInfo: req.body.shippingInfo, // 👈 Nhận từ frontend
    });

    await newOrder.save();

    // Xoá giỏ hàng sau khi đặt
    await Cart.deleteMany({ user_id: userId });

    res.status(200).json({ message: "Đặt hàng thành công!", order: newOrder });
  } catch (err) {
    console.error("🔥 Lỗi checkout:", err);
    res.status(500).json({ message: "Lỗi khi đặt hàng" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user_id: userId })
      .populate("items.product_id") // ✅ Lấy chi tiết sản phẩm trong đơn
      .sort({ createdAt: -1 })
      .lean(); // Dùng lean để làm việc dễ hơn

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product_id;

        if (!product || product.deleted || product.status === false) {
          item.recalled = true;
          item.recallMessage = `Sản phẩm đã bị thu hồi khỏi hệ thống`;
        } else {
          item.recalled = false;
        }
      }

      const allRecalled = order.items.every((item) => item.recalled);
      if (allRecalled && order.status === "new") {
        order.status = "cancelled";
        order.cancelReason =
          "Tất cả sản phẩm trong đơn đã bị thu hồi khỏi hệ thống";
        await Order.findByIdAndUpdate(order._id, {
          status: order.status,
          cancelReason: order.cancelReason,
        });
      }
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi getUserOrders:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy đơn hàng" });
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
    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    order.cancelReason = req.body.reason || "Không rõ lý do"; // Lưu lý do hủy nếu có
    await order.save();
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
    res.status(200).json({ message: "Đơn hàng đã được xóa thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};
