const Cart = require("../models/cart"); // Đường dẫn tới model product
const Product = require("../models/product"); // 👈 Đường dẫn chính xác đến model Product
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id; // ✅ Lấy user id từ middleware đã gán

    const existingItem = await Cart.findOne({ user_id: userId, product_id });

    if (existingItem) {
      // Nếu đã có thì cộng dồn số lượng
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // Nếu chưa có thì thêm mới
      const newItem = new Cart({
        user_id: userId, // ✅ bắt buộc
        product_id,
        quantity,
      });
      await newItem.save();
    }

    res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });
  } catch (error) {
    console.error("❌ Lỗi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi thêm giỏ hàng." });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Lấy giỏ hàng + populate thông tin sản phẩm
    const items = await Cart.find({ user_id: userId }).populate({
      path: "product_id",
      select: "name price discountPrice images slug deleted visible",
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
    const count = await Cart.countDocuments({ user_id: userId });
    res.status(200).json({ count });
  } catch (err) {
    console.error("🔥 Lỗi lấy cart count:", err);
    res.status(500).json({ message: "Lỗi server" });
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
