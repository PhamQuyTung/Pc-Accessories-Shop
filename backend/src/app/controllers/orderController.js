const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const orderService = require("../services/orderService");

// Import helper
const {
  populateAndNormalizeOrder,
  populateFields,
} = require("../../utils/orderHelpers");

// Hàm emit sự kiện qua Socket.IO
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

    // ✅ Dùng helper
    const order = await populateAndNormalizeOrder(
      Order.findById(newOrderDoc._id)
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

    // Normalize để frontend luôn nhận đủ field
    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    emitEvent(req, "order:cancelled", { order: populatedOrder });
    res
      .status(200)
      .json({ message: "Đơn hàng đã được hủy!", order: populatedOrder });
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

    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    emitEvent(req, "order:deleted", { orderId: order._id });
    res.status(200).json({
      message: "Đơn hàng đã bị xóa!",
      order: populatedOrder, // ✅ trả về normalized order
    });
  } catch (err) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    console.error("🔥 Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};

// Lấy danh sách đơn hàng của user
exports.getUserOrders = async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    const orders = await orderService.getUserOrders(req.userId, {
      search,
      status,
      startDate,
      endDate,
    });

    // Normalize toàn bộ
    const normalizedOrders = await Promise.all(
      orders.map(
        (o) => populateAndNormalizeOrder(Order.findById(o._id)) // reuse
      )
    );

    res.status(200).json({ orders: normalizedOrders });
  } catch (err) {
    console.error("🔥 Lỗi lấy orders:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng" });
  }
};

// Lấy tất cả đơn (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await orderService.getAllOrders(req.query);

    const normalizedOrders = await Promise.all(
      result.orders.map((o) => populateAndNormalizeOrder(Order.findById(o._id)))
    );

    res.status(200).json({ ...result, orders: normalizedOrders });
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

    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    res.status(200).json({ order: populatedOrder });
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

    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    res.json({ success: true, order: populatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Admin tạo đơn
exports.createOrderByAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = req.body;

    // --- GỘP SẢN PHẨM TRÙNG ---
    const mergedItems = body.items.reduce((acc, item) => {
      const exist = acc.find(
        (i) => i.product_id.toString() === item.product_id.toString()
      );
      if (exist) {
        exist.quantity += item.quantity;
        exist.total = exist.finalPrice * exist.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    // --- CHECK & TRỪ TỒN KHO ---
    for (const item of mergedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product_id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        throw new Error(
          `OUT_OF_STOCK:${item.productName}:${item.quantity}:${updated?.quantity || 0}`
        );
      }
    }

    // --- TÍNH TOÁN LẠI TỔNG ---
    const subtotal = mergedItems.reduce((sum, i) => sum + i.total, 0);
    const order = new Order({
      user_id: req.user?.id || null,
      items: mergedItems,
      subtotal,
      tax: body.tax,
      discount: body.discount,
      shippingFee: body.shippingFee,
      serviceFee: body.serviceFee,
      totalAmount: subtotal + body.tax + body.shippingFee + body.serviceFee,
      finalAmount: body.finalAmount,
      paymentMethod: body.paymentMethod,
      status: body.status || "new",
      shippingInfo: body.shippingInfo,
      note: body.note || "",
    });

    await order.save({ session });

    // Cập nhật soldCount cho sản phẩm trong khuyến mãi
    for (const item of req.body.items) {
      const product = await Product.findById(item.product_id || item.product);
      if (
        product &&
        product.promotionApplied &&
        product.promotionApplied.promoId
      ) {
        product.promotionApplied.soldCount =
          (product.promotionApplied.soldCount || 0) + item.quantity;
        await product.save();
      }
    }

    await session.commitTransaction();
    session.endSession();

    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    res
      .status(201)
      .json({ message: "Tạo đơn hàng thành công", order: populatedOrder });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi tạo đơn hàng:", err);

    if (err.message.startsWith("OUT_OF_STOCK")) {
      const [, name, reqQty, stock] = err.message.split(":");
      return res.status(400).json({
        error: `Sản phẩm "${name}" không đủ hàng. Yêu cầu: ${reqQty}, Tồn kho: ${stock}`,
      });
    }

    res.status(500).json({ error: "Không thể tạo đơn hàng" });
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

    const populatedOrder = await populateAndNormalizeOrder(
      Order.findById(order._id)
    );

    res.json({ message: "Đơn hàng đã được khôi phục!", order: populatedOrder });
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

    const normalizedOrders = await Promise.all(
      orders.map((o) => populateAndNormalizeOrder(Order.findById(o._id)))
    );

    res.status(200).json({ orders: normalizedOrders });
  } catch (err) {
    console.error("🔥 Lỗi lấy deleted orders:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn đã xóa" });
  }
};
