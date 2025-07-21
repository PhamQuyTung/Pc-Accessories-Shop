const Cart = require("../models/cart"); // Đường dẫn tới model product
const Product = require("../models/product"); // 👈 Đường dẫn chính xác đến model Product
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { product_id, quantity } = req.body;

  try {
    const productIdObj = new mongoose.Types.ObjectId(product_id);

    let cartItem = await Cart.findOne({
      user_id: userId,
      product_id: productIdObj,
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        user_id: userId,
        product_id: productIdObj,
        quantity,
      });
      await cartItem.save();
    }
    console.log("✅ userId trong addToCart:", req.userId);

    res.status(200).json({
      message: "Sản phẩm đã được thêm vào giỏ hàng",
      cartItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("👉 userId từ token:", userId); // debug log

    // Lấy toàn bộ sản phẩm giỏ hàng của người dùng đó
    const items = await Cart.find({ user_id: userId }).populate("product_id");

    if (!items) {
      return res.status(200).json({ items: [] }); // Không có giỏ hàng vẫn trả về mảng rỗng
    }

    res.status(200).json(items);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy giỏ hàng:", error); // ghi ra lỗi chi tiết
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
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
