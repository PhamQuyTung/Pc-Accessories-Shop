// chứa business logic
const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

const populateFields = "name slug price discountPrice images status deleted";

// --- helper restore stock ---
async function restoreStockForItems(items, session = null) {
  if (!Array.isArray(items) || items.length === 0) return;
  const ops = items
    .map((item) => {
      if (!item || !item.product_id) return null;
      // product_id có thể là ObjectId hoặc object populated
      const pid = item.product_id._id ? item.product_id._id : item.product_id;
      if (!pid) return null;
      return Product.findByIdAndUpdate(
        pid,
        { $inc: { quantity: item.quantity || 0 } },
        { new: true, session }
      );
    })
    .filter(Boolean);
  if (ops.length) {
    await Promise.all(ops);
  }
}

// === Helpers ===
function calcTotals(orderItems, body) {
  const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
  const tax = body.tax || 0;
  const discount = body.discount || 0;
  const shippingFee = body.shippingFee || 0;
  const serviceFee = body.serviceFee || 0;
  const totalAmount = subtotal + tax + shippingFee + serviceFee;
  const finalAmount = totalAmount - discount;
  return {
    subtotal,
    tax,
    discount,
    shippingFee,
    serviceFee,
    totalAmount,
    finalAmount,
  };
}

// === Services ===
async function checkoutOrder(userId, body, session) {
  // Lấy giỏ hàng user + populate sản phẩm
  const cartItems = await Cart.find({ user_id: userId }).populate({
    path: "product_id",
    select: populateFields,
  });
  if (!cartItems.length) throw new Error("EMPTY_CART");

  // Chỉ cần đảm bảo có product và chưa bị đánh dấu xóa
  const validCartItems = cartItems.filter((c) => {
    const p = c.product_id;
    return p && !p.deleted;
  });
  if (!validCartItems.length) throw new Error("INVALID_CART_ITEMS");

  const orderItems = [];
  for (const item of validCartItems) {
    const p = item.product_id;
    const finalPrice = p.discountPrice > 0 ? p.discountPrice : p.price;

    // Rồi để check số lượng khi trừ tồn kho
    const updated = await Product.findOneAndUpdate(
      { _id: p._id, quantity: { $gte: item.quantity } },
      { $inc: { quantity: -item.quantity } },
      { new: true, session }
    );
    if (!updated) {
      const current = await Product.findById(p._id).select("quantity name");
      throw new Error(
        `OUT_OF_STOCK:${p.name}:${item.quantity}:${current?.quantity || 0}`
      );
    }

    orderItems.push({
      product_id: p._id,
      quantity: item.quantity,
      price: p.price,
      discountPrice: p.discountPrice,
      finalPrice,
      total: finalPrice * item.quantity,
    });
  }

  // Tính tổng tiền
  const totals = calcTotals(orderItems, body);

  // Tạo order
  const newOrderArr = await Order.create(
    [
      {
        user_id: userId,
        items: orderItems,
        ...totals,
        shippingInfo: body.shippingInfo,
        paymentMethod: body.paymentMethod,
      },
    ],
    { session }
  );

  // Xóa giỏ hàng sau khi checkout
  await Cart.deleteMany({ user_id: userId }, { session });

  return newOrderArr[0];
}

async function cancelOrder(orderId, userId, reason) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");
  if (["cancelled", "completed"].includes(order.status))
    throw new Error("CANNOT_CANCEL");

  // restore stock only if it hasn't been returned yet (order wasn't cancelled/deleted)
  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
  }

  order.status = "cancelled";
  order.cancelReason = reason || "Không rõ lý do";
  await order.save();
  return order;
}

async function deleteOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");

  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
  }

  order.status = "deleted";
  await order.save();

  // populate lại để trả về cho controller
  return await Order.findById(order._id).populate(
    "items.product_id",
    "name slug price discountPrice images status deleted"
  );
}

async function getUserOrders(userId) {
  return await Order.find({
    user_id: userId,
    status: { $ne: "deleted" }, // 👈 bỏ các đơn bị xóa mềm
  })
    .populate(
      "items.product_id",
      "name slug price discountPrice images status deleted"
    )
    .sort({ createdAt: -1 });
}

async function getAllOrders(includeDeleted = false) {
  const query = includeDeleted ? {} : { status: { $ne: "deleted" } };
  return Order.find(query)
    .populate("items.product_id", populateFields)
    .sort({ createdAt: -1 });
}

async function getOrderById(orderId) {
  return Order.findById(orderId).populate("items.product_id", populateFields);
}

async function updateOrderStatus(orderId, status) {
  return Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate(
    "items.product_id",
    "name slug images"
  );
}

async function createOrderByAdmin(body, userId) {
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
  } = body;
  if (!items?.length) throw new Error("NO_ITEMS");

  const orderItems = items.map((i) => ({
    product_id: i.product_id || null,
    productName: i.productName || "",
    quantity: i.quantity,
    price: i.price,
  }));

  const order = new Order({
    user_id: userId || null,
    items: orderItems,
    subtotal,
    tax,
    serviceFee,
    shippingFee,
    discount,
    totalAmount: finalAmount,
    finalAmount,
    paymentMethod: paymentMethod?.toLowerCase(),
    status: status || "new",
    shippingInfo,
    note,
  });
  return order.save();
}

async function getOrderStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const agg = (match, group, sort) =>
    Order.aggregate([{ $match: match }, { $group: group }, { $sort: sort }]);

  const byHour = await agg(
    { createdAt: { $gte: startOfDay }, status: { $ne: "deleted" } },
    {
      _id: {
        hour: { $hour: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
      },
      orders: { $sum: 1 },
      revenue: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$finalAmount", 0] },
      },
    },
    { "_id.hour": 1 }
  );

  const byDay = await agg(
    { createdAt: { $gte: startOfWeek }, status: { $ne: "deleted" } },
    {
      _id: {
        day: {
          $dayOfMonth: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" },
        },
      },
      orders: { $sum: 1 },
      revenue: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$finalAmount", 0] },
      },
    },
    { "_id.day": 1 }
  );

  const byMonth = await agg(
    { createdAt: { $gte: startOfYear }, status: { $ne: "deleted" } },
    {
      _id: {
        month: { $month: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
      },
      orders: { $sum: 1 },
      revenue: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$finalAmount", 0] },
      },
    },
    { "_id.month": 1 }
  );

  const byYear = await agg(
    { status: { $ne: "deleted" } },
    {
      _id: {
        year: { $year: { date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
      },
      orders: { $sum: 1 },
      revenue: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$finalAmount", 0] },
      },
    },
    { "_id.year": 1 }
  );

  return { byHour, byDay, byMonth, byYear };
}

async function restoreOrder(orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Lấy order đã bị xóa mềm
    const order = await Order.findOne({
      _id: orderId,
      status: "deleted",
    }).session(session);
    if (!order) throw new Error("NOT_FOUND");

    // Kiểm tra tồn kho & trừ số lượng
    for (const item of order.items) {
      const pid = item.product_id._id ? item.product_id._id : item.product_id;

      const updated = await Product.findOneAndUpdate(
        { _id: pid, quantity: { $gte: item.quantity } }, // phải còn đủ hàng
        { $inc: { quantity: -item.quantity } }, // trừ tồn kho
        { new: true, session }
      );
      if (!updated) {
        throw new Error(`OUT_OF_STOCK:${pid}`);
      }
    }

    // Cập nhật lại trạng thái đơn hàng
    order.status = "new";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function forceDeleteOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("NOT_FOUND");

  // ❌ KHÔNG restore stock nếu đơn đã cancel hoặc đã vào thùng rác
  if (order.status !== "cancelled" && order.status !== "deleted") {
    await restoreStockForItems(order.items);
  }

  await Order.findByIdAndDelete(orderId);
  return order;
}

async function forceDeleteOrderByUser(orderId, userId) {
  // Tìm order thuộc về user
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");

  // Chỉ cho phép xóa vĩnh viễn nếu order đã hủy hoặc đã vào thùng rác
  if (!["cancelled", "deleted"].includes(order.status))
    throw new Error("CANNOT_FORCE_DELETE");

  // Nếu order trước đó chưa trả hàng (status không ở cancelled/deleted) -> restore
  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
  }

  await Order.findByIdAndDelete(orderId);
  return order;
}

async function getDeletedOrders() {
  return Order.find({ status: "deleted" })
    .populate("items.product_id", populateFields)
    .sort({ createdAt: -1 });
}

module.exports = {
  checkoutOrder,
  cancelOrder,
  deleteOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrderByAdmin,
  getOrderStats,
  restoreOrder,
  forceDeleteOrder,
  forceDeleteOrderByUser,
  getDeletedOrders,
};
