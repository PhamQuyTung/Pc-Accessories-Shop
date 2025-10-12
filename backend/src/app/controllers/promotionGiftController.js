// app/controllers/promotionGiftController.js
const PromotionGift = require("../models/promotionGift");
const Product = require("../models/product");

exports.list = async (req, res) => {
  try {
    const gifts = await PromotionGift.find()
      .populate("conditionProduct", "name price images")
      .populate("relatedProduct", "name price images");
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;

    if (!body.title || !body.discountType || !body.conditionProduct)
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    const gift = await PromotionGift.create({
      title: body.title.trim(),
      description: body.description || "",
      discountType: body.discountType,
      discountValue: body.discountValue || 0,
      conditionProduct: body.conditionProduct,
      relatedProduct: body.relatedProduct,
      link: body.link || "",
      createdBy: req.user?._id,
    });

    const populated = await gift.populate([
      { path: "conditionProduct", select: "name price images" },
      { path: "relatedProduct", select: "name price images" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const gift = await PromotionGift.findById(id);
    if (!gift) return res.status(404).json({ message: "Không tìm thấy" });
    await gift.deleteOne();
    res.json({ message: "Đã xoá khuyến mãi quà tặng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.byProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy các promotionGift có điều kiện là sản phẩm này
    const gifts = await PromotionGift.find({
      active: true,
      conditionProduct: productId,
    }).populate("relatedProduct", "name price images");

    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
