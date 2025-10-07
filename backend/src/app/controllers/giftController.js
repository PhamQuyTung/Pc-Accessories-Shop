const Gift = require("../models/gift");
const mongoose = require("mongoose");

// 👉 Lấy tất cả gifts
exports.getAllGifts = async (req, res) => {
  try {
    const gifts = await Gift.find().sort({ createdAt: -1 }).populate({
      path: "products.productId",
      select: "name slug images price discountPrice status",
    });

    res.json(gifts);
  } catch (err) {
    console.error("Lỗi khi lấy gifts:", err);
    res.status(500).json({ message: "Lỗi server khi lấy gifts" });
  }
};

// 👉 Lấy gift theo ID
exports.getGiftById = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id).populate({
      path: "products.productId",
      select: "name slug images price discountPrice status",
    });

    if (!gift) return res.status(404).json({ message: "Không tìm thấy gift" });
    res.json(gift);
  } catch (err) {
    console.error("Lỗi khi lấy gift:", err);
    res.status(500).json({ message: "Lỗi server khi lấy gift" });
  }
};

// 👉 Tạo gift mới
exports.createGift = async (req, res) => {
  try {
    const { title, products = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Thiếu title gift" });
    }

    const gift = await Gift.create({
      title,
      products,
    });

    res.status(201).json(gift);
  } catch (err) {
    console.error("Lỗi tạo gift:", err);
    res.status(400).json({
      message: "Tạo gift thất bại",
      error: err.message || err,
    });
  }
};

// 👉 Cập nhật gift
exports.updateGift = async (req, res) => {
  try {
    const updated = await Gift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Gift không tồn tại" });

    res.json(updated);
  } catch (err) {
    console.error("Lỗi cập nhật gift:", err);
    res.status(400).json({ message: "Cập nhật gift thất bại" });
  }
};

// 👉 Xóa gift
exports.deleteGift = async (req, res) => {
  try {
    const deleted = await Gift.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Gift không tồn tại" });

    res.json({ message: "Xóa gift thành công" });
  } catch (err) {
    console.error("Lỗi xóa gift:", err);
    res.status(400).json({ message: "Xóa gift thất bại" });
  }
};

// 👉 (tùy chọn) thêm sản phẩm vào gift
exports.addProductToGift = async (req, res) => {
  try {
    const { giftId, product } = req.body;

    if (!mongoose.Types.ObjectId.isValid(giftId)) {
      return res.status(400).json({ message: "giftId không hợp lệ" });
    }

    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).json({ message: "Gift không tồn tại" });

    gift.products.push(product);
    await gift.save();

    res.json({ message: "Thêm sản phẩm vào gift thành công", gift });
  } catch (err) {
    console.error("Lỗi khi thêm product vào gift:", err);
    res.status(500).json({ message: "Lỗi server khi thêm product" });
  }
};

// 👉 (tùy chọn) xóa 1 sản phẩm khỏi gift
exports.removeProductFromGift = async (req, res) => {
  try {
    const { giftId, productId } = req.body;

    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).json({ message: "Gift không tồn tại" });

    gift.products = gift.products.filter(
      (p) => p.productId.toString() !== productId.toString()
    );
    await gift.save();

    res.json({ message: "Xóa sản phẩm khỏi gift thành công", gift });
  } catch (err) {
    console.error("Lỗi khi xóa product khỏi gift:", err);
    res.status(500).json({ message: "Lỗi server khi xóa product" });
  }
};
