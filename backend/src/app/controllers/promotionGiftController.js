// app/controllers/promotionGiftController.js
const PromotionGift = require("../models/promotionGift");
const Product = require("../models/product");

/* 📦 Lấy danh sách tất cả khuyến mãi quà tặng */
exports.list = async (req, res) => {
  try {
    const gifts = await PromotionGift.find()
      .populate("conditionProduct", "name price images")
      .populate("relatedProducts", "name price images");
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ➕ Thêm mới khuyến mãi quà tặng */
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      conditionProduct,
      relatedProducts,
      link,
    } = req.body;

    // 🧩 Kiểm tra dữ liệu đầu vào
    if (
      !title ||
      !discountType ||
      !conditionProduct ||
      !relatedProducts?.length
    )
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    const value = Number(discountValue);
    if (isNaN(value) || value <= 0)
      return res.status(400).json({ message: "Giá trị giảm không hợp lệ" });

    // Kiểm tra sản phẩm chính và các sản phẩm liên quan
    const main = await Product.findById(conditionProduct);
    if (!main)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm chính" });

    const related = await Product.find({ _id: { $in: relatedProducts } });
    if (!related.length)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm mua kèm" });

    // ⚠️ Nếu là giảm tiền mặt, kiểm tra không vượt quá giá thấp nhất
    if (discountType === "amount") {
      const minPrice = Math.min(...related.map((r) => r.price));
      if (value > minPrice)
        return res.status(400).json({
          message: `Giá trị giảm (${value.toLocaleString(
            "vi-VN"
          )}₫) không được lớn hơn giá sản phẩm thấp nhất (${minPrice.toLocaleString(
            "vi-VN"
          )}₫)`,
        });
    }

    // ✅ Tạo mới khuyến mãi
    const gift = await PromotionGift.create({
      title: title.trim(),
      description,
      discountType,
      discountValue: value,
      conditionProduct,
      relatedProducts,
      link,
      createdBy: req.user?._id,
    });

    const populated = await gift.populate([
      { path: "conditionProduct", select: "name price images" },
      { path: "relatedProducts", select: "name price images" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✏️ Cập nhật khuyến mãi quà tặng */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      discountType,
      discountValue,
      conditionProduct,
      relatedProducts,
      link,
    } = req.body;

    const gift = await PromotionGift.findById(id);
    if (!gift)
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    // 🧩 Kiểm tra dữ liệu
    if (
      !title ||
      !discountType ||
      !conditionProduct ||
      !relatedProducts?.length
    )
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    const value = Number(discountValue);
    if (isNaN(value) || value <= 0)
      return res.status(400).json({ message: "Giá trị giảm phải là số dương" });

    if (!["percent", "amount"].includes(discountType))
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });

    const main = await Product.findById(conditionProduct);
    const related = await Product.find({ _id: { $in: relatedProducts } });

    if (!main || !related.length)
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm chính hoặc sản phẩm mua kèm",
      });

    if (discountType === "percent" && value > 100)
      return res
        .status(400)
        .json({ message: "Giảm phần trăm không được vượt quá 100%" });

    if (discountType === "amount") {
      const minPrice = Math.min(...related.map((r) => r.price));
      if (value > minPrice)
        return res.status(400).json({
          message: `Giá trị giảm (${value.toLocaleString(
            "vi-VN"
          )}₫) không được lớn hơn giá sản phẩm thấp nhất (${minPrice.toLocaleString(
            "vi-VN"
          )}₫)`,
        });
    }

    // ✅ Cập nhật dữ liệu
    gift.title = title.trim();
    gift.description = description || "";
    gift.discountType = discountType;
    gift.discountValue = value;
    gift.conditionProduct = conditionProduct;
    gift.relatedProducts = relatedProducts;
    gift.link = link || "";

    await gift.save();

    const populated = await gift.populate([
      { path: "conditionProduct", select: "name price images" },
      { path: "relatedProducts", select: "name price images" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 🗑️ Xoá khuyến mãi quà tặng */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const gift = await PromotionGift.findById(id);
    if (!gift)
      return res
        .status(404)
        .json({ message: "Không tìm thấy khuyến mãi quà tặng" });

    await gift.deleteOne();
    res.json({ message: "Đã xoá khuyến mãi quà tặng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 🔍 Lấy khuyến mãi quà tặng theo productId */
exports.byProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const gifts = await PromotionGift.find({
      active: true,
      conditionProduct: productId,
    }).populate("relatedProducts", "name price images");

    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
