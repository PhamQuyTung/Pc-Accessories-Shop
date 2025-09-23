const Order = require("../models/order");
const Cart = require("../models/cart");

exports.checkoutOrder = async (req, res) => {
  const userId = req.userId;

  try {
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select: "name deleted status price discountPrice images",
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng đang trống!" });
    }

    // ✅ Lọc sản phẩm hợp lệ
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

    // ✅ Chuẩn hóa item trong đơn hàng
    const orderItems = validCartItems.map((item) => {
      const p = item.product_id;
      const finalPrice =
        p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;

      return {
        product_id: p._id,
        quantity: item.quantity,
        price: p.price, // giá gốc
        discountPrice: p.discountPrice, // giá giảm (nếu có)
        finalPrice, // giá thực tế
        total: finalPrice * item.quantity,
      };
    });

    // ✅ Tính toán tổng
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = req.body.tax || 0;
    const discount = req.body.discount || 0;
    const shippingFee = req.body.shippingFee || 0;
    const serviceFee = req.body.serviceFee || 0;

    // Tổng trước giảm giá
    const totalAmount = subtotal + tax + shippingFee + serviceFee;

    // Tổng sau giảm giá
    const finalAmount = totalAmount - discount;

    let newOrder = new Order({
      user_id: userId,
      items: orderItems,
      subtotal,
      tax,
      discount,
      shippingFee,
      serviceFee,
      totalAmount,
      finalAmount,
      shippingInfo: req.body.shippingInfo,
      paymentMethod: req.body.paymentMethod,
    });

    await newOrder.save();

    // 👇 Populate thêm thông tin sản phẩm
    newOrder = await newOrder.populate(
      "items.product_id",
      "name slug price discountPrice images status deleted"
    );

    // ✅ Xóa giỏ hàng sau khi đặt
    await Cart.deleteMany({ user_id: userId });

    // Emit realtime nếu có socket
    const io = req.app.locals.io;
    if (io) io.emit("order:new", { order: newOrder });

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
    if (io) io.emit("order:cancelled", { order });

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
    const order = await Order.findOneAndUpdate(
      { _id: orderId, user_id: userId },
      { status: "deleted" }, // 👈 Soft delete
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }

    // 👇 Emit realtime từ app.locals
    const io = req.app.locals.io;
    if (io) io.emit("order:deleted", { orderId });

    res.status(200).json({ message: "Đơn hàng đã được đánh dấu xóa!", order });
  } catch (err) {
    console.error("🔥 Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.userId })
      .populate(
        "items.product_id",
        "name price discountPrice images status deleted"
      ) // 👈 thêm images
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("🔥 Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "items.product_id",
        "name price discountPrice images status deleted"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("🔥 Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "items.product_id",
      "name slug price discountPrice images status deleted"
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("🔥 Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product_id", "name slug images");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Tạo đơn hàng bởi admin
exports.createOrderByAdmin = async (req, res) => {
  try {
    const {
      shippingInfo,
      note,
      paymentMethod,
      status,
      items,
      subtotal,
      tax,
      serviceFee,
      shippingFee,
      discount,
      finalAmount,
    } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ message: "Đơn hàng phải có ít nhất 1 sản phẩm!" });
    }

    const orderItems = items.map((item) => ({
      product_id: item.product_id || null, // nếu admin nhập tay thì có thể null
      productName: item.productName || "", // 👈 lưu lại tên sản phẩm nhập tay
      quantity: item.quantity,
      price: item.price,
    }));

    const order = new Order({
      user_id: req.userId || null, // Admin có thể tạo đơn cho khách lẻ
      items: orderItems,
      subtotal,
      tax,
      serviceFee,
      shippingFee,
      discount,
      totalAmount: finalAmount,
      finalAmount,
      paymentMethod: paymentMethod?.toLowerCase(), // 👈 ép về lowercase,
      status: status || "new",
      shippingInfo,
      note,
    });

    await order.save();

    // Emit realtime nếu có socket
    const io = req.app.locals.io;
    if (io) io.emit("order:new", { order });

    return res.status(201).json({ message: "Tạo đơn hàng thành công!", order });
  } catch (err) {
    console.error("🔥 Lỗi tạo đơn hàng (admin):", err);
    return res.status(500).json({ message: "Lỗi khi admin tạo đơn hàng" });
  }
};

// Lấy thống kê đơn hàng theo giờ/ngày/tháng/năm (có timezone VN)
exports.getOrderStats = async (req, res) => {
  try {
    // Theo giờ trong ngày hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const byHour = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: "completed" } },
      {
        $group: {
          _id: {
            hour: {
              $hour: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.hour": 1 } },
    ]);

    // Theo ngày trong tuần này
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Chủ nhật = 0
    startOfWeek.setHours(0, 0, 0, 0);

    const byDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: "completed" } },
      {
        $group: {
          _id: {
            day: {
              $dayOfMonth: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // Theo tháng trong năm nay
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const byMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
      {
        $group: {
          _id: {
            month: {
              $month: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Theo năm (toàn bộ lịch sử)
    const byYear = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: {
              $year: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    res.json({
      byHour,
      byDay,
      byMonth,
      byYear,
    });
  } catch (err) {
    console.error("🔥 Lỗi khi thống kê đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi thống kê đơn hàng" });
  }
};
