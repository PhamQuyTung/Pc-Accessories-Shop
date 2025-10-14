// app/controllers/promotionGiftController.js
const PromotionGift = require("../models/promotionGift");
const Product = require("../models/product");

/* ============================================================
   🧩 Helper functions
============================================================ */
const populateGift = [
  { path: "conditionProducts", select: "name price images slug" },
  { path: "relatedProducts", select: "name price images slug" },
];

const validateGiftData = (body) => {
  const {
    title,
    discountType,
    discountValue,
    conditionProducts,
    relatedProducts,
  } = body;

  if (
    !title ||
    !discountType ||
    !Array.isArray(conditionProducts) ||
    !conditionProducts.length ||
    !Array.isArray(relatedProducts) ||
    !relatedProducts.length
  ) {
    return "Thiếu dữ liệu bắt buộc";
  }

  const value = Number(discountValue);
  if (isNaN(value) || value <= 0) return "Giá trị giảm không hợp lệ";

  if (!["percent", "amount"].includes(discountType))
    return "Loại giảm giá không hợp lệ";

  if (discountType === "percent" && value > 100)
    return "Giảm phần trăm không được vượt quá 100%";

  return null; // hợp lệ
};

/* ============================================================
   🔧 Helper xử lý logic chung
============================================================ */
const checkProducts = async (conditionProducts, relatedProducts) => {
  const [mains, related] = await Promise.all([
    Product.find({ _id: { $in: conditionProducts } }),
    Product.find({ _id: { $in: relatedProducts } }),
  ]);

  if (!mains.length) throw new Error("Không tìm thấy sản phẩm chính");
  if (!related.length) throw new Error("Không tìm thấy sản phẩm mua kèm");

  return { mains, related };
};

const validateDiscount = (discountType, discountValue, related) => {
  const value = Number(discountValue);
  if (discountType === "amount") {
    const minPrice = Math.min(...related.map((r) => r.price));
    if (value > minPrice)
      throw new Error(
        `Giá trị giảm (${value.toLocaleString(
          "vi-VN"
        )}₫) vượt quá giá sản phẩm thấp nhất (${minPrice.toLocaleString(
          "vi-VN"
        )}₫)`
      );
  }
};

/* ============================================================
   📦 Lấy danh sách tất cả khuyến mãi quà tặng
============================================================ */
exports.list = async (req, res) => {
  try {
    const gifts = await PromotionGift.find().populate(populateGift);
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   ➕ CREATE - Refactor gọn gàng, dùng helper & auto link
============================================================ */
exports.create = async (req, res) => {
  try {
    // 🧩 Kiểm tra dữ liệu cơ bản
    const error = validateGiftData(req.body);
    if (error) return res.status(400).json({ message: error });

    const {
      title,
      description,
      discountType,
      discountValue,
      conditionProducts,
      relatedProducts,
      link,
    } = req.body;

    // 🔍 Kiểm tra tồn tại sản phẩm
    const { related } = await checkProducts(conditionProducts, relatedProducts);

    // ⚙️ Kiểm tra hợp lệ giảm giá
    validateDiscount(discountType, discountValue, related);

    // ✅ Tạo mới khuyến mãi
    const gift = await PromotionGift.create({
      title: title.trim(),
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      conditionProducts,
      relatedProducts,
      link: link?.trim() || "",
      createdBy: req.user?._id,
    });

    // 🔗 Nếu chưa có link, tự động tạo link theo _id
    if (!gift.link) {
      gift.link = `http://localhost:3000/promotion/${gift._id}`;
      await gift.save();
    }

    // 🔄 Populate dữ liệu trả về
    const populated = await gift.populate(populateGift);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================ 
   ✏️ Cập nhật khuyến mãi quà tặng (Refactor)
============================================================ */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const gift = await PromotionGift.findById(id);
    if (!gift)
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    // 🧩 Kiểm tra dữ liệu đầu vào
    const error = validateGiftData(req.body);
    if (error) return res.status(400).json({ message: error });

    const {
      title,
      description,
      discountType,
      discountValue,
      conditionProducts,
      relatedProducts,
      link,
    } = req.body;

    // 🔍 Kiểm tra sản phẩm bằng helper
    const { related } = await checkProducts(conditionProducts, relatedProducts);

    // ⚙️ Kiểm tra giảm giá hợp lệ
    validateDiscount(discountType, discountValue, related);

    // ✅ Gán dữ liệu mới vào bản ghi
    Object.assign(gift, {
      title: title.trim(),
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      conditionProducts,
      relatedProducts,
      link: link?.trim() || "",
    });

    // 🔗 Nếu link đang trống → tự tạo mới theo _id
    if (!gift.link) {
      gift.link = `http://localhost:3000/promotion/${gift._id}`;
    }

    await gift.save();

    // 🔄 Populate để trả về dữ liệu đầy đủ
    const populated = await gift.populate(populateGift);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🗑️ Xoá khuyến mãi quà tặng
============================================================ */
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

/* ============================================================
   🔍 Lấy khuyến mãi quà tặng theo productId
============================================================ */
exports.byProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const gifts = await PromotionGift.find({
      conditionProducts: productId, // ✅ fix: đúng với schema
      active: true,
    }).populate(populateGift);

    res.json(gifts || []);
  } catch (err) {
    console.error("Lỗi khi lấy khuyến mãi:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   🔄 Bật/tắt trạng thái khuyến mãi
============================================================ */
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const gift = await PromotionGift.findById(id);
    if (!gift)
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    gift.active = !gift.active;
    await gift.save();

    res.json({ message: `Đã ${gift.active ? "bật" : "tắt"} khuyến mãi`, gift });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
