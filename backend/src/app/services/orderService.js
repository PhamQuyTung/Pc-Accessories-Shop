// chứa business logic
const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const removeVietnameseTones = require("../../utils/removeVietnameseTones");

const populateFields = `
  name slug price discountPrice images status deleted quantity lockPromotionId gifts
  promotionApplied.promoId promotionApplied.percent promotionApplied.soldCount promotionApplied.appliedAt
`;

// --- helper restore stock ---
async function restoreStockForItems(items, session = null) {
  if (!Array.isArray(items) || items.length === 0) return;
  const ops = items
    .map((item) => {
      if (!item || !item.product_id) return null;
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

// --- helper restore gift stock ---
async function restoreGiftStockForItems(items, session = null) {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const product =
      item.product_id && item.product_id._id
        ? await Product.findById(item.product_id._id)
        : await Product.findById(item.product_id);
    if (!product || !Array.isArray(product.gifts)) continue;

    // Duyệt qua các nhóm quà
    for (const giftGroup of product.gifts) {
      if (!Array.isArray(giftGroup.products)) continue;

      for (const gItem of giftGroup.products) {
        const giftId = gItem.productId?._id || gItem.productId;
        const totalGiftQty = gItem.quantity * item.quantity;

        await Product.findByIdAndUpdate(
          giftId,
          { $inc: { quantity: totalGiftQty } },
          { new: true, session }
        );
      }
    }
  }
}

// --- helper update sold count ---
async function updateSoldCountForItems(items, session = null, revert = false) {
  if (!Array.isArray(items) || items.length === 0) return;
  for (const item of items) {
    const pid = item.product_id._id ? item.product_id._id : item.product_id;
    const product = await Product.findById(pid).session(session);
    if (product?.promotionApplied?.promoId) {
      const delta = revert ? -item.quantity : item.quantity;
      product.promotionApplied.soldCount =
        (product.promotionApplied.soldCount || 0) + delta;
      if (product.promotionApplied.soldCount < 0) {
        product.promotionApplied.soldCount = 0;
      }
      await product.save({ session });
    }
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
// === Checkout tạo đơn ===
async function checkoutOrder(userId, body, session) {
  // 1️⃣ Lấy giỏ hàng người dùng
  const cartItems = await Cart.find({ user_id: userId }).populate({
    path: "product_id",
    select: populateFields,
    populate: {
      path: "gifts",
      select: "title products.productId products.quantity products.productName",
      populate: { path: "products.productId", select: "name quantity" },
    },
  });

  if (!cartItems.length) throw new Error("EMPTY_CART");

  // 2️⃣ Lọc sản phẩm hợp lệ (còn hiển thị, chưa xóa)
  const validCartItems = cartItems.filter(
    (c) => c.product_id && !c.product_id.deleted
  );
  if (!validCartItems.length) throw new Error("INVALID_CART_ITEMS");

  // 3️⃣ Chuẩn bị danh sách sản phẩm để tạo đơn
  const orderItems = [];

  for (const item of validCartItems) {
    const product = item.product_id;
    console.log("🎁 Gifts for product:", product.name, product.gifts);

    const finalPrice =
      product.discountPrice > 0 ? product.discountPrice : product.price;

    // 3.1️⃣ Trừ tồn kho sản phẩm chính
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product._id, quantity: { $gte: item.quantity } },
      { $inc: { quantity: -item.quantity } },
      { new: true, session }
    );

    if (!updatedProduct) {
      const current = await Product.findById(product._id).select(
        "quantity name"
      );
      throw new Error(
        `OUT_OF_STOCK:${product.name}:${item.quantity}:${current?.quantity || 0}`
      );
    }

    // 3.2️⃣ Trừ tồn kho quà tặng (nếu có)
    if (Array.isArray(product.gifts) && product.gifts.length > 0) {
      for (const giftGroup of product.gifts) {
        if (
          Array.isArray(giftGroup.products) &&
          giftGroup.products.length > 0
        ) {
          for (const gItem of giftGroup.products) {
            const giftId = gItem.productId?._id || gItem.productId;
            const totalGiftQty = gItem.quantity * item.quantity; // nhân theo số lượng sản phẩm chính

            const giftProduct = await Product.findOneAndUpdate(
              { _id: giftId, quantity: { $gte: totalGiftQty } },
              { $inc: { quantity: -totalGiftQty } },
              { new: true, session }
            );

            if (!giftProduct) {
              const currentGift =
                await Product.findById(giftId).select("quantity name");
              throw new Error(
                `OUT_OF_STOCK_GIFT:${currentGift?.name || "Quà tặng"}:${totalGiftQty}:${currentGift?.quantity || 0}`
              );
            }
          }
        }
      }
    }

    // 3.3️⃣ Thêm sản phẩm vào danh sách order
    orderItems.push({
      product_id: product._id,
      quantity: item.quantity,
      price: product.price,
      discountPrice: product.discountPrice,
      finalPrice,
      total: finalPrice * item.quantity,
    });
  }

  // 4️⃣ Tính tổng tiền
  const totals = calcTotals(orderItems, body);

  // 5️⃣ Tạo đơn hàng
  const [newOrder] = await Order.create(
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

  // 6️⃣ Cập nhật soldCount + Xóa giỏ hàng
  await updateSoldCountForItems(orderItems, session);
  await Cart.deleteMany({ user_id: userId }, { session });

  return newOrder;
}

// Hủy đơn hàng
async function cancelOrder(orderId, userId, reason) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");
  if (["cancelled", "completed"].includes(order.status))
    throw new Error("CANNOT_CANCEL");

  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
    await restoreGiftStockForItems(order.items);
    await updateSoldCountForItems(order.items, null, true);
  }

  order.status = "cancelled";
  order.cancelReason = reason || "Không rõ lý do";
  await order.save();
  return order;
}

// Xóa mềm đơn hàng
async function deleteOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");

  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
    await restoreGiftStockForItems(order.items);
    await updateSoldCountForItems(order.items, null, true);
  }

  order.status = "deleted";
  await order.save();

  return await Order.findById(order._id).populate(
    "items.product_id",
    "name slug price discountPrice images status deleted"
  );
}

// User - get own orders
async function getUserOrders(userId, filters = {}) {
  const { search, status, startDate, endDate } = filters;
  const query = { user_id: userId, status: { $ne: "deleted" } };

  if (search) {
    const normalizedSearch = removeVietnameseTones(search.trim());
    const safeSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query["shippingInfo.searchName"] = { $regex: new RegExp(safeSearch, "i") };
  }

  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  return Order.find(query)
    .collation({ locale: "vi", strength: 2 })
    .populate("items.product_id", populateFields)
    .sort({ createdAt: -1 });
}

// Admin - get all orders
async function getAllOrders(filters = {}, includeDeleted = false) {
  const {
    search,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    paymentMethod,
    customerPhone,
    customerEmail,
    isPaid,
    isDelivered,
    sortField = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = filters;

  const query = {};
  if (!includeDeleted) query.status = { $ne: "deleted" };

  if (search) {
    const normalizedSearch = removeVietnameseTones(search.trim());
    const safeSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeSearch, "i");

    if (mongoose.Types.ObjectId.isValid(search)) {
      query.$or = [{ _id: search }];
    } else {
      query.$or = [
        { "shippingInfo.searchName": regex },
        { "shippingInfo.phone": regex },
        { "shippingInfo.email": regex },
        { "shippingInfo.address": regex },
      ];
    }
  }

  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (customerPhone) {
    query["shippingInfo.phone"] = { $regex: customerPhone, $options: "i" };
  }
  if (customerEmail) {
    query["shippingInfo.email"] = { $regex: customerEmail, $options: "i" };
  }

  if (isPaid !== undefined) query.isPaid = isPaid === "true";
  if (isDelivered !== undefined) query.isDelivered = isDelivered === "true";

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (minAmount || maxAmount) {
    query.finalAmount = {};
    if (minAmount) query.finalAmount.$gte = Number(minAmount);
    if (maxAmount) query.finalAmount.$lte = Number(maxAmount);
  }

  const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .collation({ locale: "vi", strength: 2 })
      .populate("items.product_id", populateFields)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
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
  if (!body.items?.length) throw new Error("NO_ITEMS");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderItems = [];

    for (const item of body.items) {
      const pid = item.product_id;
      if (!pid) throw new Error("INVALID_PRODUCT");

      const updated = await Product.findOneAndUpdate(
        { _id: pid, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        throw new Error(
          `OUT_OF_STOCK:${item.productName}:${item.quantity}:${
            updated?.quantity || 0
          }`
        );
      }

      const finalPrice =
        item.discountPrice > 0 ? item.discountPrice : item.price;

      orderItems.push({
        product_id: pid,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice || 0,
        finalPrice,
        total: finalPrice * item.quantity,
      });
    }

    const totals = calcTotals(orderItems, body);

    const orderArr = await Order.create(
      [
        {
          user_id: userId || null,
          items: orderItems,
          ...totals,
          shippingInfo: body.shippingInfo,
          paymentMethod: body.paymentMethod,
          note: body.note,
          status: body.status || "new",
        },
      ],
      { session }
    );

    await updateSoldCountForItems(orderItems, session);

    await session.commitTransaction();
    session.endSession();

    return orderArr[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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
    const order = await Order.findOne({
      _id: orderId,
      status: "deleted",
    }).session(session);
    if (!order) throw new Error("NOT_FOUND");

    for (const item of order.items) {
      const pid = item.product_id._id ? item.product_id._id : item.product_id;
      const updated = await Product.findOneAndUpdate(
        { _id: pid, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );
      if (!updated) throw new Error(`OUT_OF_STOCK:${pid}`);
    }

    // 👉 Trừ tồn quà tặng khi khôi phục đơn
    await (async () => {
      for (const item of order.items) {
        const product =
          item.product_id && item.product_id._id
            ? await Product.findById(item.product_id._id).session(session)
            : await Product.findById(item.product_id).session(session);
        if (!product || !Array.isArray(product.gifts)) continue;

        for (const giftGroup of product.gifts) {
          if (!Array.isArray(giftGroup.products)) continue;
          for (const gItem of giftGroup.products) {
            const giftId = gItem.productId?._id || gItem.productId;
            const totalGiftQty = gItem.quantity * item.quantity;

            const giftProduct = await Product.findOneAndUpdate(
              { _id: giftId, quantity: { $gte: totalGiftQty } },
              { $inc: { quantity: -totalGiftQty } },
              { new: true, session }
            );
            if (!giftProduct) throw new Error(`OUT_OF_STOCK_GIFT:${giftId}`);
          }
        }
      }
    })();

    order.status = "new";
    await order.save({ session });

    await updateSoldCountForItems(order.items, session, false);

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

  if (!["cancelled", "deleted"].includes(order.status)) {
    await restoreStockForItems(order.items);
    await restoreGiftStockForItems(order.items);
    await updateSoldCountForItems(order.items, null, true);
  }

  await Order.findByIdAndDelete(orderId);
  return order;
}

async function forceDeleteOrderByUser(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) throw new Error("NOT_FOUND");

  if (!["cancelled", "deleted"].includes(order.status))
    throw new Error("CANNOT_FORCE_DELETE");

  await restoreStockForItems(order.items);
  await restoreGiftStockForItems(order.items);
  await updateSoldCountForItems(order.items, null, true);

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
