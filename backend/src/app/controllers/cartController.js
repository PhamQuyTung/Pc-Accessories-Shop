const Cart = require("../models/cart");
const Product = require("../models/product");
const Gift = require("../models/gift");
const mongoose = require("mongoose");

// ======================================================
// ADD TO CART
// ======================================================
exports.addToCart = async (req, res) => {
  try {
    const { product_id, variation_id, quantity } = req.body;
    const userId = req.userId;

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu product_id hoặc quantity." });
    }

    // Kiểm tra sản phẩm tồn tại & khả dụng
    const product = await Product.findById(product_id);
    if (!product || product.deleted || !product.visible) {
      return res.status(404).json({ message: "Sản phẩm không khả dụng." });
    }

    // Tìm item đã tồn tại
    const existingItem = await Cart.findOne({
      user_id: userId,
      product_id,
      variation_id: variation_id || null,
      isGift: false,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await Cart.create({
        user_id: userId,
        product_id,
        variation_id: variation_id || null,
        quantity,
        isGift: false,
      });
    }

    // =============================
    // Auto-add Gifts
    // =============================
    const gifts = await Gift.find({ "products.productId": product_id });

    for (const gift of gifts) {
      for (const g of gift.products) {
        const giftProduct = await Product.findById(g.productId);
        if (!giftProduct || giftProduct.deleted || !giftProduct.visible)
          continue;

        await Cart.findOneAndUpdate(
          { user_id: userId, product_id: g.productId, isGift: true },
          { $set: { quantity: g.quantity } },
          { upsert: true, new: true }
        );
      }
    }

    return res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi thêm giỏ hàng." });
  }
};

// ======================================================
// GET CART
// ======================================================
// ================= GET CART (optimized version) =================
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const items = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select:
        "name price discountPrice images slug deleted visible hasGifts gifts variations defaultVariantId",
      populate: [
        {
          path: "gifts.products.productId",
          select: "name slug price",
        },
        {
          path: "variations.attributes.attrId", // ✅ Populate attribute names
          select: "name type",
        },
        {
          path: "variations.attributes.terms", // ✅ Populate term names
          select: "name colorCode",
        },
      ],
    });

    if (!items || items.length === 0) {
      return res.status(200).json({ items: [], removed: [] });
    }

    const validItems = [];
    const removed = [];

    for (const item of items) {
      const product = item.product_id;

      if (!product || product.deleted || !product.visible) {
        removed.push({ _id: item._id, name: product?.name });
        await Cart.deleteOne({ _id: item._id });
        continue;
      }

      // ✅ Map variation với attributes đã populate
      const variation =
        item.variation_id && product.variations
          ? product.variations.id(item.variation_id)
          : null;

      validItems.push({
        _id: item._id,
        user_id: item.user_id,
        product_id: product,
        variation_id: variation, // ✅ Đã có attrId.name + terms[].name
        quantity: item.quantity,
        isGift: item.isGift,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    return res.status(200).json({ items: validItems, removed });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

// ======================================================
// GET CART COUNT
// ======================================================
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      populate: {
        path: "gifts.products.productId",
        select: "name slug finalPrice",
      },
    });

    let total = 0;

    for (const item of cartItems) {
      total += item.quantity;

      if (item.product_id?.gifts?.length) {
        for (const gift of item.product_id.gifts) {
          for (const p of gift.products) {
            total += p.quantity * item.quantity;
          }
        }
      }
    }

    return res.json({ count: total });
  } catch (error) {
    console.error("❌ Lỗi getCartCount:", error);
    return res.status(500).json({ message: "Lỗi server khi đếm giỏ hàng" });
  }
};

// ======================================================
// REMOVE ITEM
// ======================================================
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId, product_id } = req.body;
    const userId = req.userId;

    if (!cartItemId && !product_id) {
      return res
        .status(400)
        .json({ message: "Thiếu cartItemId hoặc product_id" });
    }

    if (cartItemId) {
      await Cart.deleteOne({ _id: cartItemId, user_id: userId });
    } else {
      await Cart.deleteOne({ user_id: userId, product_id });
    }

    return res.status(200).json({ message: "Đã xoá sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("❌ Lỗi removeFromCart:", error);
    return res.status(500).json({ message: "Lỗi khi xoá sản phẩm" });
  }
};

// ======================================================
// UPDATE QUANTITY
// ======================================================
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const userId = req.userId;

    if (!cartItemId || typeof quantity !== "number") {
      return res
        .status(400)
        .json({ message: "Missing cartItemId or quantity" });
    }

    const item = await Cart.findOne({ _id: cartItemId, user_id: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    item.quantity = quantity;
    await item.save();

    return res.status(200).json({ message: "Cập nhật số lượng thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật số lượng:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng" });
  }
};

// ======================================================
// BULK ADD (RE-ADD)
// ======================================================
exports.bulkAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const items = req.body.items;

    for (const item of items) {
      await Cart.findOneAndUpdate(
        { user_id: userId, product_id: item.product_id },
        { $inc: { quantity: item.quantity } },
        { upsert: true }
      );
    }

    return res.json({ message: "Thêm lại sản phẩm thành công!" });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi khi thêm lại sản phẩm",
      error: error.message,
    });
  }
};
