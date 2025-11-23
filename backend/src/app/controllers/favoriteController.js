// controllers/favoriteController.js
const Favorite = require("../models/favorite");
const Product = require("../models/product");

exports.addFavorite = async (req, res) => {
  const user_id = req.user?.id; // vì bạn đang gán: req.user = { id: user._id, ... }
  const { product_id } = req.body;

  try {
    const existing = await Favorite.findOne({ user_id, product_id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Sản phẩm đã có trong mục yêu thích" });
    }

    await Favorite.create({ user_id, product_id });
    res.status(200).json({ message: "Đã thêm vào mục yêu thích" });
  } catch (error) {
    console.error("addFavorite error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.removeFavorite = async (req, res) => {
  const user_id = req.user?.id; // vì bạn đang gán: req.user = { id: user._id, ... }
  const product_id = req.params.productId;

  try {
    await Favorite.deleteOne({ user_id, product_id });
    res.status(200).json({ message: "Đã xoá khỏi mục yêu thích" });
  } catch (error) {
    console.error("removeFavorite error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.checkFavorite = async (req, res) => {
  const user_id = req.user?.id; // vì bạn đang gán: req.user = { id: user._id, ... }
  const product_id = req.params.productId;

  try {
    const exists = await Favorite.exists({ user_id, product_id });
    res.status(200).json({ isFavorite: !!exists });
  } catch (error) {
    console.error("checkFavorite error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const favorites = await Favorite.find({
      user_id: userId,
    }).populate({
      path: "product_id",
      match: {
        deleted: { $ne: true }, // Chỉ lấy sản phẩm chưa xóa
        visible: true, // Chỉ lấy sản phẩm đang hiển thị
      },
    });

    // ⚠️ do .populate match có thể trả về null nếu product bị ẩn => cần lọc null ra
    const products = favorites
      .filter((fav) => fav.product_id) // bỏ những product null (do không match)
      .map((fav) => fav.product_id); // trả về danh sách sản phẩm

    res.status(200).json(products);
  } catch (error) {
    console.error("getFavorites error:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sản phẩm yêu thích" });
  }
};

exports.toggleFavorite = async (req, res) => {
  const user_id = req.user?.id;
  const product_id = req.params.productId;

  try {
    // Kiểm tra sản phẩm đã thích chưa
    const exists = await Favorite.findOne({ user_id, product_id });

    if (exists) {
      // Nếu đã thích → bỏ thích
      await Favorite.deleteOne({ user_id, product_id });
      return res.status(200).json({ isFavorite: false });
    }

    // Nếu chưa thích → thêm vào yêu thích
    await Favorite.create({ user_id, product_id });
    res.status(200).json({ isFavorite: true });

  } catch (error) {
    console.error("toggleFavorite error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

