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

    const favorites = await Favorite.find({ user_id: userId }).populate(
      "product_id"
    );

    const products = favorites.map((fav) => fav.product_id);
    res.status(200).json(products);
  } catch (error) {
    console.error("getFavorites error:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sản phẩm yêu thích" });
  }
};
