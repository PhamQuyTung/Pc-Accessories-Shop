// app/controllers/promotionGiftController.js
const PromotionGift = require("../models/promotionGift");
const Product = require("../models/product");

// 📦 Lấy danh sách tất cả khuyến mãi quà tặng
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

// ➕ Thêm mới khuyến mãi quà tặng
exports.create = async (req, res) => {
  try {
    const body = req.body;

    // 🧩 Kiểm tra các trường bắt buộc
    if (
      !body.title ||
      !body.discountType ||
      !body.conditionProduct ||
      !body.relatedProduct
    ) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    // 📋 Kiểm tra discountValue hợp lệ
    const discountValue = Number(body.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      return res.status(400).json({ message: "Giá trị giảm phải là số dương" });
    }

    // 🧠 Kiểm tra discountType
    if (!["percent", "amount"].includes(body.discountType)) {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });
    }

    // 📦 Kiểm tra sản phẩm tồn tại
    const conditionProduct = await Product.findById(body.conditionProduct);
    const relatedProduct = await Product.findById(body.relatedProduct);

    if (!conditionProduct || !relatedProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm áp dụng hoặc sản phẩm quà tặng",
      });
    }

    // ⚠️ Giới hạn giá trị giảm
    if (body.discountType === "percent" && discountValue > 100) {
      return res
        .status(400)
        .json({ message: "Giảm phần trăm không được vượt quá 100%" });
    }

    if (
      body.discountType === "amount" &&
      discountValue > relatedProduct.price
    ) {
      return res.status(400).json({
        message: `Giá trị giảm (${discountValue.toLocaleString(
          "vi-VN"
        )}₫) không được lớn hơn giá sản phẩm (${relatedProduct.price.toLocaleString("vi-VN")}₫)`,
      });
    }

    // ✅ Tạo mới
    const gift = await PromotionGift.create({
      title: body.title.trim(),
      description: body.description || "",
      discountType: body.discountType,
      discountValue,
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

// ✏️ Cập nhật khuyến mãi quà tặng
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const gift = await PromotionGift.findById(id);
    if (!gift)
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    // 🧩 Kiểm tra các trường bắt buộc
    if (
      !body.title ||
      !body.discountType ||
      !body.conditionProduct ||
      !body.relatedProduct
    ) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const discountValue = Number(body.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      return res.status(400).json({ message: "Giá trị giảm phải là số dương" });
    }

    if (!["percent", "amount"].includes(body.discountType)) {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });
    }

    const conditionProduct = await Product.findById(body.conditionProduct);
    const relatedProduct = await Product.findById(body.relatedProduct);

    if (!conditionProduct || !relatedProduct) {
      return res
        .status(404)
        .json({
          message: "Không tìm thấy sản phẩm áp dụng hoặc sản phẩm quà tặng",
        });
    }

    if (body.discountType === "percent" && discountValue > 100) {
      return res
        .status(400)
        .json({ message: "Giảm phần trăm không được vượt quá 100%" });
    }

    if (
      body.discountType === "amount" &&
      discountValue > relatedProduct.price
    ) {
      return res.status(400).json({
        message: `Giá trị giảm (${discountValue.toLocaleString("vi-VN")}₫) không được lớn hơn giá sản phẩm (${relatedProduct.price.toLocaleString("vi-VN")}₫)`,
      });
    }

    // ✅ Cập nhật dữ liệu
    gift.title = body.title.trim();
    gift.description = body.description || "";
    gift.discountType = body.discountType;
    gift.discountValue = discountValue;
    gift.conditionProduct = body.conditionProduct;
    gift.relatedProduct = body.relatedProduct;
    gift.link = body.link || "";

    await gift.save();

    const populated = await gift.populate([
      { path: "conditionProduct", select: "name price images" },
      { path: "relatedProduct", select: "name price images" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Xoá khuyến mãi
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

// 🔍 Lấy khuyến mãi quà tặng theo productId
exports.byProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const gifts = await PromotionGift.find({
      active: true,
      conditionProduct: productId,
    }).populate("relatedProduct", "name price images");

    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
