// app/controllers/promotionGiftController.js
const PromotionGift = require("../models/promotionGift");
const Product = require("../models/product");
const { computeProductStatus } = require("../../../../shared/productStatus");

/* ============================================================
   🧩 Helper functions
============================================================ */
const populateGift = [
  {
    path: "conditionProducts",
    select:
      "name slug price discountPrice images specs category variations defaultVariantId quantity",
    populate: {
      path: "category",
      select: "name slug specs",
    },
  },
  {
    path: "relatedProducts",
    select:
      "name slug price discountPrice images specs category variations defaultVariantId quantity",
    populate: {
      path: "category",
      select: "name slug specs",
    },
  },
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
          "vi-VN",
        )}₫) vượt quá giá sản phẩm thấp nhất (${minPrice.toLocaleString(
          "vi-VN",
        )}₫)`,
      );
  }
};

/* ============================================================
   📦 Lấy danh sách tất cả khuyến mãi quà tặng
============================================================ */
exports.list = async (req, res) => {
  try {
    // lean() trả về plain object, vì vậy không còn toObject/Document nữa
    const gifts = await PromotionGift.find().populate(populateGift).lean();

    // nếu cần tính status giống bên productController
    gifts.forEach((p) => {
      if (Array.isArray(p.relatedProducts)) {
        p.relatedProducts = p.relatedProducts.map((prod) => ({
          ...prod,
          status: computeProductStatus(prod, { importing: prod.importing }),
        }));
      }
      if (Array.isArray(p.conditionProducts)) {
        p.conditionProducts = p.conditionProducts.map((prod) => ({
          ...prod,
          status: computeProductStatus(prod, { importing: prod.importing }),
        }));
      }
    });

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

/* ============================================================
   🧮 Áp dụng giảm giá theo giỏ hàng
============================================================ */
/* ============================================================
   🧮 Áp dụng giảm giá theo giỏ hàng (phiên bản GearVN logic)
============================================================ */
exports.applyCart = async (req, res) => {
  try {
    const { cartItems } = req.body; // [{ product_id, quantity, createdAt }]
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return res.json({ discounts: [], totalDiscount: 0 });

    // 🔍 Lấy tất cả promotion đang active
    const promotions = await PromotionGift.find({ active: true }).populate([
      { path: "conditionProducts", select: "_id name price" },
      { path: "relatedProducts", select: "_id name price" },
    ]);

    let discounts = [];
    let totalDiscount = 0;

    // 👉 Sắp xếp cartItems theo thời gian thêm để ưu tiên giảm cho sản phẩm thêm sớm hơn
    const sortedCartItems = [...cartItems].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    // =========================================================
    // Duyệt từng chương trình khuyến mãi
    // =========================================================
    for (const promo of promotions) {
      const conditionIds = promo.conditionProducts.map((p) => p._id.toString());
      const relatedIds = promo.relatedProducts.map((p) => p._id.toString());

      // Đếm tổng số lượng sản phẩm chính và sản phẩm liên quan trong giỏ
      const mainCount = sortedCartItems
        .filter((i) => conditionIds.includes(i.product_id))
        .reduce((sum, i) => sum + i.quantity, 0);

      const relatedItems = sortedCartItems.filter((i) =>
        relatedIds.includes(i.product_id),
      );

      if (mainCount === 0 || relatedItems.length === 0) continue;

      // Số lượng cặp đủ điều kiện giảm
      let eligiblePairs = mainCount;

      // =========================================================
      // Áp dụng cho từng sản phẩm liên quan (có thể nhiều loại)
      // =========================================================
      for (const item of relatedItems) {
        if (eligiblePairs <= 0) break; // Hết lượt giảm

        const relatedProduct = promo.relatedProducts.find(
          (p) => p._id.toString() === item.product_id,
        );
        if (!relatedProduct) continue;

        const unitPrice = relatedProduct.price;

        // ✅ Số lượng được giảm và không được giảm
        const discountedQty = Math.min(item.quantity, eligiblePairs);
        const normalQty = Math.max(item.quantity - discountedQty, 0);

        // ✅ Tính số tiền giảm
        let discountAmount = 0;
        if (promo.discountType === "percent") {
          discountAmount = (unitPrice * promo.discountValue) / 100;
        } else {
          discountAmount = promo.discountValue;
        }

        const totalItemDiscount = discountAmount * discountedQty;

        // ✅ Push thông tin vào mảng (thêm thông tin về sản phẩm điều kiện để frontend có thể hiển thị)
        discounts.push({
          productId: item.product_id,
          discountPerItem: discountAmount,
          totalDiscount: totalItemDiscount,
          promotionTitle: promo.title,
          discountedQty,
          normalQty,
          promotionId: promo._id,
          promotionConditionIds: (promo.conditionProducts || []).map((p) => p._id.toString()),
        });

        totalDiscount += totalItemDiscount;

        // Giảm số lượt đủ điều kiện còn lại
        eligiblePairs -= discountedQty;
      }
    }

    // =========================================================
    // Trả kết quả
    // =========================================================
    return res.json({ discounts, totalDiscount });
  } catch (err) {
    console.error("❌ applyCart error:", err);
    return res.status(500).json({ message: err.message });
  }
};