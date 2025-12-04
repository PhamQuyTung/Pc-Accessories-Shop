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

  for (const item of items) {
    if (!item || !item.product_id) continue;

    const pid = item.product_id._id ? item.product_id._id : item.product_id;
    const vid = item.variation_id;

    if (vid) {
      // ✅ Restore từ variation
      await Product.findOneAndUpdate(
        { _id: pid, "variations._id": vid },
        { $inc: { "variations.$.quantity": item.quantity || 0 } },
        { new: true, session }
      );
      console.log(`✅ Restored ${item.quantity} for variation ${vid}`);
    } else {
      // Restore từ product
      await Product.findByIdAndUpdate(
        pid,
        { $inc: { quantity: item.quantity || 0 } },
        { new: true, session }
      );
      console.log(`✅ Restored ${item.quantity} for product ${pid}`);
    }
  }
}

// --- helper restore gift stock ---
async function restoreGiftStockForItems(items, session = null) {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const productId = item.product_id?._id || item.product_id;
    const product = await Product.findById(productId);
    if (!product) continue;

    console.log("🧩 Restoring stock for:", product.name);

    // // 1️⃣ Hoàn stock cho sản phẩm chính
    // const mainRestoreQty = item.quantity;
    // await Product.findByIdAndUpdate(
    //   productId,
    //   { $inc: { quantity: mainRestoreQty } },
    //   { session }
    // );
    // console.log(
    //   `✅ Restored ${mainRestoreQty} for main product ${product.name}`
    // );

    // 2️⃣ Nếu đơn có quà, hoàn lại từng quà
    if (Array.isArray(item.gifts) && item.gifts.length > 0) {
      for (const g of item.gifts) {
        const giftId = g.productId?._id || g.productId;
        const restoreQty = g.quantity * item.quantity;

        await Product.findByIdAndUpdate(
          giftId,
          { $inc: { quantity: restoreQty } },
          { session }
        );
        console.log(`🎁 Restored ${restoreQty} for gift ${giftId}`);
      }
    } else {
      console.log("⚠️ No gifts found in order item:", product.name);
    }
  }
}

// --- helper deduct gift stock (khi restore đơn) ---
async function deductGiftStockForItems(items, session = null) {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    if (!Array.isArray(item.gifts) || item.gifts.length === 0) continue;

    for (const g of item.gifts) {
      const giftId = g.productId?._id || g.productId;
      const totalGiftQty = (g.quantity || 1) * (item.quantity || 1);

      const giftProduct = await Product.findOneAndUpdate(
        { _id: giftId, quantity: { $gte: totalGiftQty } },
        { $inc: { quantity: -totalGiftQty } },
        { new: true, session }
      );

      if (!giftProduct) {
        const currentGift =
          await Product.findById(giftId).select("name quantity");
        throw new Error(
          `OUT_OF_STOCK_GIFT:${currentGift?.name || "Quà tặng"}:${totalGiftQty}:${currentGift?.quantity || 0}`
        );
      }

      console.log(`🎁 Deducted ${totalGiftQty} for gift ${giftProduct.name}`);
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
    select:
      "name price discountPrice images slug deleted visible hasGifts gifts variations defaultVariantId",
    populate: {
      path: "gifts",
      select: "title products",
      populate: { path: "products.productId", select: "name quantity" },
    },
  });

  if (!cartItems.length) throw new Error("EMPTY_CART");

  const validCartItems = cartItems.filter(
    (c) => c.product_id && !c.product_id.deleted
  );
  if (!validCartItems.length) throw new Error("INVALID_CART_ITEMS");

  // ✅ FIX: Batch populate variation attributes (SAME AS getCart)
  const productIds = [
    ...new Set(validCartItems.map((item) => String(item.product_id._id))),
  ];

  const Product = require("../models/product");
  
  const productsWithVariations = await Product.find(
    { _id: { $in: productIds } }
  )
    .select("_id variations")
    .populate("variations.attributes.attrId", "name")
    .populate("variations.attributes.terms", "name colorCode");

  const variationMap = {};
  for (const p of productsWithVariations) {
    const variations = p.toObject?.().variations || p.variations;
    variationMap[String(p._id)] = variations;
  }

  // ✅ FIX: Replace product.variations trong cartItems với populated version
  for (const item of validCartItems) {
    if (variationMap[String(item.product_id._id)]) {
      item.product_id.variations = variationMap[String(item.product_id._id)];
    }
  }

  // 2️⃣ Process order items
  const orderItems = [];

  for (const item of validCartItems) {
    const product = item.product_id;
    const variationId = item.variation_id;

    console.log(
      `📦 Processing item: product=${product._id}, variation=${variationId}, qty=${item.quantity}`
    );

    // ✅ TÌM VARIATION NẾU CÓ - normalize ID comparison
    let variation = null;
    let targetQty = product.quantity; // Default: product quantity

    if (variationId && product.variations && product.variations.length > 0) {
      // 🔍 Find variation by comparing string IDs
      variation = product.variations.find(
        (v) => String(v._id) === String(variationId)
      );

      if (variation) {
        targetQty = variation.quantity;
        console.log(
          `✅ Found variation: ${String(variation._id)}, stock=${targetQty}`
        );
      } else {
        console.warn(`⚠️ Variation not found: ${variationId}`);
      }
    }

    // ✅ KIỂM TRA TỒN KHO
    if (targetQty < item.quantity) {
      console.error(
        `❌ OUT_OF_STOCK: ${product.name}, requested=${item.quantity}, available=${targetQty}, variation=${String(
          variationId
        )}`
      );
      throw new Error(
        `OUT_OF_STOCK:${product.name}:${item.quantity}:${targetQty}`
      );
    }

    // ✅ TRỪ TỒN KHO - ưu tiên variation
    if (variation) {
      console.log(
        `🔄 Deducting ${item.quantity} from variation ${String(variation._id)}`
      );

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, "variations._id": variationId },
        { $inc: { "variations.$.quantity": -item.quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        console.error(
          `❌ Failed to update variation stock for ${product.name}`
        );
        throw new Error(
          `Không thể cập nhật tồn kho biến thể ${product.name}`
        );
      }

      const updatedVariation = updatedProduct.variations.find(
        (v) => String(v._id) === String(variationId)
      );
      console.log(
        `✅ Updated variation stock: ${product.name} - new qty=${updatedVariation?.quantity}`
      );
    } else {
      console.log(`🔄 Deducting ${item.quantity} from product ${product.name}`);

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        console.error(
          `❌ Failed to update product stock for ${product.name}`
        );
        throw new Error(
          `OUT_OF_STOCK:${product.name}:${item.quantity}:${product.quantity}`
        );
      }

      console.log(
        `✅ Updated product stock: ${product.name} - new qty=${updatedProduct.quantity}`
      );
    }

    // Tính giá (lấy từ variation hoặc product)
    const finalPrice =
      variation && variation.discountPrice > 0
        ? variation.discountPrice
        : variation?.price ||
          (product.discountPrice > 0 ? product.discountPrice : product.price);

    console.log(`💰 Final price: ${finalPrice}`);

    // ✅ TRỪ TỒN KHO QUÀ TẶNG
    if (Array.isArray(product.gifts) && product.gifts.length > 0) {
      for (const giftGroup of product.gifts) {
        if (
          Array.isArray(giftGroup.products) &&
          giftGroup.products.length > 0
        ) {
          for (const gItem of giftGroup.products) {
            const giftId = gItem.productId?._id || gItem.productId;
            const totalGiftQty = gItem.quantity * item.quantity;

            const giftProduct = await Product.findOneAndUpdate(
              { _id: giftId, quantity: { $gte: totalGiftQty } },
              { $inc: { quantity: -totalGiftQty } },
              { new: true, session }
            );

            if (!giftProduct) {
              const currentGift = await Product.findById(giftId).select(
                "quantity name"
              );
              throw new Error(
                `OUT_OF_STOCK_GIFT:${currentGift?.name || "Quà tặng"}:${totalGiftQty}:${
                  currentGift?.quantity || 0
                }`
              );
            }
          }
        }
      }
    }

    let giftSnapshot = [];
    if (Array.isArray(product.gifts) && product.gifts.length > 0) {
      giftSnapshot = product.gifts.flatMap((group) =>
        (group.products || []).map((g) => ({
          productId: g.productId?._id || g.productId,
          quantity: g.quantity,
        }))
      );
    }

    // ✅ LƯU ORDER ITEM KÈM VARIATION_ID
    orderItems.push({
      product_id: product._id,
      variation_id: variationId || null,
      productName: product.name,
      quantity: item.quantity,
      price: variation?.price || product.price,
      discountPrice: variation?.discountPrice || product.discountPrice,
      finalPrice,
      total: finalPrice * item.quantity,
      gifts: giftSnapshot,
    });

    console.log(`✅ Order item added: ${product.name}, qty=${item.quantity}`);
  }

  // 4️⃣ Tính tổng tiền
  const totals = calcTotals(orderItems, body);

  console.log(`📊 Order totals:`, totals);

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

  console.log(`✅ Order created: ${newOrder._id}`);

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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({
      _id: orderId,
      user_id: userId,
    }).session(session);
    if (!order) throw new Error("NOT_FOUND");

    if (!["cancelled", "deleted"].includes(order.status)) {
      await restoreStockForItems(order.items, session);
      await restoreGiftStockForItems(order.items, session);
      await updateSoldCountForItems(order.items, session, true);
    }

    order.status = "deleted";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return await Order.findById(order._id).populate(
      "items.product_id",
      "name slug price discountPrice images status deleted"
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ deleteOrder error:", err.message);
    throw err;
  }
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

    // 👉 1. Trừ tồn sản phẩm chính
    for (const item of order.items) {
      const pid = item.product_id._id ? item.product_id._id : item.product_id;
      const updated = await Product.findOneAndUpdate(
        { _id: pid, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        const p = await Product.findById(pid).select("name quantity");
        throw new Error(
          `OUT_OF_STOCK:${p?.name || pid}:${item.quantity}:${p?.quantity ?? 0}`
        );
      }
    }

    // 👉 2. Trừ tồn kho quà tặng (gộp logic thành hàm riêng)
    await deductGiftStockForItems(order.items, session);

    // 👉 3. Cập nhật số lượng bán ra
    await updateSoldCountForItems(order.items, session, false);

    // 👉 4. Đặt lại trạng thái đơn hàng
    order.status = "new";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi restoreOrder:", err.message);
    throw err;
  }
}

async function forceDeleteOrder(orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("NOT_FOUND");

    if (!["cancelled", "deleted"].includes(order.status)) {
      await restoreStockForItems(order.items, session);
      await restoreGiftStockForItems(order.items, session);
      await updateSoldCountForItems(order.items, session, true);
    }

    await Order.findByIdAndDelete(orderId).session(session);

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ forceDeleteOrder error:", err.message);
    throw err;
  }
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
