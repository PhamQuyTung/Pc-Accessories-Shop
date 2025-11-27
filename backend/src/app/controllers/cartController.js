const Cart = require("../models/cart"); // Đường dẫn tới model product
const Product = require("../models/product"); // 👈 Đường dẫn chính xác đến model Product
const Gift = require("../models/gift"); // 👈 Đường dẫn chính xác đến model Gift
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  try {
    const { product_id, variation_id, quantity } = req.body;
    const userId = req.userId; // ✅ lấy từ middleware xác thực

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu product_id hoặc quantity." });
    }

    // 🟢 Kiểm tra sản phẩm tồn tại & còn hiển thị
    const product = await Product.findById(product_id);
    if (!product || product.deleted || product.visible === false) {
      return res.status(404).json({ message: "Sản phẩm không khả dụng." });
    }

    // 🟠 Cộng dồn nếu sản phẩm đã có trong giỏ
    const existingItem = await Cart.findOne({
      user_id: userId,
      product_id,
      variation_id,
      isGift: false,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await Cart.create({
        user_id: userId,
        product_id,
        variation_id,
        quantity,
        isGift: false,
      });
    }

    // 🎁 Tự động thêm quà tặng (nếu có chương trình khuyến mãi)
    const gifts = await Gift.find({ "products.productId": product_id });

    if (gifts.length > 0) {
      for (const gift of gifts) {
        for (const g of gift.products) {
          // ⚙️ Kiểm tra sản phẩm quà có tồn tại và hợp lệ
          const giftProduct = await Product.findById(g.productId);
          if (
            !giftProduct ||
            giftProduct.deleted ||
            giftProduct.visible === false
          )
            continue;

          // 💡 Thêm quà tặng vào giỏ nếu chưa có
          await Cart.findOneAndUpdate(
            { user_id: userId, product_id: g.productId, isGift: true },
            { $set: { quantity: g.quantity } }, // số lượng quà cố định
            { upsert: true, new: true }
          );
        }
      }
    }

    return res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi thêm giỏ hàng." });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Lấy giỏ hàng + populate thông tin sản phẩm
    const items = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select:
        "name price discountPrice images slug deleted visible hasGifts gifts",
      populate: {
        path: "gifts",
        select: "title products", // 👈 đúng với schema Gift
        populate: {
          path: "products.productId",
          select: "name slug finalPrice",
        },
      },
    });

    // 2. Trường hợp giỏ hàng rỗng
    if (!items || items.length === 0) {
      return res.status(200).json({ items: [], removed: [] });
    }

    // 3. Tách sản phẩm hợp lệ và sản phẩm bị thu hồi
    const validItems = [];
    const removed = [];

    for (const item of items) {
      const product = item.product_id;
      console.log("product trong cart là:", item.product_id);
      console.log("🔍 Kiểm tra sản phẩm:", product?.name);
      console.log("   ➤ Deleted:", product?.deleted);
      console.log("   ➤ Visible:", product?.visible);

      if (!product || product.deleted || product.visible === false) {
        console.log("❌ Sản phẩm không hợp lệ, xóa khỏi giỏ");
        removed.push({
          _id: item._id,
          name: product?.name || "Không xác định",
        });
        console.log("🧾 product:", product);
        console.log(
          "🧾 deleted:",
          product?.deleted,
          "visible:",
          product?.visible
        );

        // Xóa item không hợp lệ khỏi DB
        await Cart.deleteOne({ _id: item._id });
      } else {
        validItems.push(item);
      }
    }

    // 4. Trả kết quả về client
    return res.status(200).json({ items: validItems, removed });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    const userId = req.userId;

    // Lấy toàn bộ sản phẩm trong giỏ
    const cartItems = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      populate: {
        path: "gifts.products.productId",
        select: "name slug finalPrice",
      },
    });

    if (!cartItems || cartItems.length === 0) {
      return res.json({ count: 0 });
    }

    let totalCount = 0;

    for (const item of cartItems) {
      const qty = item.quantity;
      totalCount += qty; // ✅ Cộng theo số lượng chính xác

      // ✅ Nếu có quà, nhân thêm theo qty (giống logic tính tổng giá)
      if (item.product_id?.gifts?.length > 0) {
        for (const gift of item.product_id.gifts) {
          for (const p of gift.products) {
            totalCount += p.quantity * qty;
          }
        }
      }
    }

    return res.json({ count: totalCount });
  } catch (error) {
    console.error("❌ Lỗi getCartCount:", error);
    return res.status(500).json({ message: "Lỗi server khi đếm giỏ hàng" });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.userId;
  const { product_id } = req.body;

  try {
    const productIdObj = new mongoose.Types.ObjectId(product_id);
    await Cart.deleteOne({ user_id: userId, product_id: productIdObj });
    res.status(200).json({ message: "Đã xoá sản phẩm khỏi giỏ hàng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá sản phẩm" });
  }
};

exports.updateCartQuantity = async (req, res) => {
  const userId = req.userId;
  const { product_id, quantity } = req.body;

  try {
    const cartItem = await Cart.findOne({ user_id: userId, product_id });

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cập nhật số lượng thành công", cartItem });
  } catch (err) {
    console.error("🔥 Lỗi khi cập nhật số lượng:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng" });
  }
};

exports.bulkAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const items = req.body.items; // [{ product_id, quantity }, ...]

    for (const item of items) {
      await Cart.findOneAndUpdate(
        { user_id: userId, product_id: item.product_id },
        { $inc: { quantity: item.quantity } },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Thêm lại sản phẩm thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Có lỗi khi thêm lại sản phẩm", error: err.message });
  }
};
