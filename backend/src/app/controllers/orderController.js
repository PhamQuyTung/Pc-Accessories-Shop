const Order = require("../models/order");
const Cart = require("../models/cart");

exports.checkoutOrder = async (req, res) => {
  const userId = req.userId;
  console.log("📦 Body nhận được:", req.body);

  try {
    // 1. Populate cart => cartItems
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select: "name deleted status price discountPrice",
    });

    console.log(
      "🔍 Cart items sau populate:",
      cartItems.map((item) => ({
        product_id: item.product_id?._id,
        name: item.product_id?.name,
        deleted: item.product_id?.deleted,
        status: item.product_id?.status,
        price: item.product_id?.price,
        discountPrice: item.product_id?.discountPrice,
      }))
    );

    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng đang trống!" });
    }

    // 2. Lọc các sản phẩm hợp lệ: chưa xóa & đang hiển thị
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

    // 3. Chuẩn bị danh sách sản phẩm đặt hàng
    const orderItems = validCartItems
      .filter((item) => {
        const p = item.product_id;
        return p && (p.price || p.discountPrice);
      })
      .map((item) => {
        const p = item.product_id;
        return {
          product_id: p._id,
          quantity: item.quantity,
          price: p.discountPrice > 0 ? p.discountPrice : p.price,
        };
      });

    if (!orderItems.length) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm hợp lệ để tạo đơn hàng!" });
    }

    console.log("✅ orderItems chuẩn bị tạo:", orderItems);

    // 4. Tính toán các khoản chi phí
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const tax = Math.round(totalAmount * 0.15); // 15% VAT
    const discount = Math.round(totalAmount * 0.1); // 10% giảm giá
    const finalAmount = totalAmount + tax - discount;

    // Kiểm tra các trường bắt buộc
    if (!req.body.paymentMethod) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn phương thức thanh toán!" });
    }

    // 5. Tạo đơn hàng mới (sử dụng dữ liệu từ frontend gửi lên)
    const newOrder = new Order({
      user_id: userId,
      items: orderItems,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      discount: req.body.discount,
      shippingFee: req.body.shippingFee,
      serviceFee: req.body.serviceFee,
      totalAmount:
        req.body.total ||
        totalAmount +
          req.body.tax +
          req.body.shippingFee +
          req.body.serviceFee -
          req.body.discount,
      finalAmount:
        req.body.total ||
        totalAmount +
          req.body.tax +
          req.body.shippingFee +
          req.body.serviceFee -
          req.body.discount,
      shippingInfo: req.body.shippingInfo,
      paymentMethod: req.body.paymentMethod,
    });

    await newOrder.save();

    // 6. Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.deleteMany({ user_id: userId });

    res.status(200).json({
      message: "Đặt hàng thành công!",
      order: newOrder,
    });
  } catch (err) {
    console.error("🔥 Lỗi khi đặt hàng:", err);
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
