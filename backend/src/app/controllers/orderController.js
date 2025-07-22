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
    const orders = await Order.find({ user_id: req.userId }).populate(
      "items.product_id"
    );
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};
