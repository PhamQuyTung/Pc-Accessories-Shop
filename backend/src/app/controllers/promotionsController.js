const Promotion = require("../models/promotion");
const Product = require("../models/product");
const { isActiveNow } = require("../../utils/promotionTime");
const { rollbackPromotion } = require("../../utils/promotionUtils");
const Review = require("../models/review");
const slugify = require("slugify");

// Chỉ cho phép gán sản phẩm đang "còn hàng trở lên"
const ELIGIBLE_STATUSES = ["còn hàng", "nhiều hàng", "sản phẩm mới"];

// ===== Helper =====
async function applyPromotionImmediately(promo) {
  if (!promo.assignedProducts || promo.assignedProducts.length === 0) return;

  for (let i = 0; i < promo.assignedProducts.length; i++) {
    const pp = promo.assignedProducts[i];
    const product = await Product.findById(pp.product);
    if (!product) continue;

    if (
      product.lockPromotionId &&
      String(product.lockPromotionId) !== String(promo._id)
    ) {
      continue;
    }

    // ✅ Lưu backup nếu chưa có
    if (pp.backupDiscountPrice == null) {
      pp.backupDiscountPrice = Number(product.discountPrice || 0);
    }
    if (pp.backupDiscountPercent == null) {
      pp.backupDiscountPercent = Number(product.discountPercent || 0);
    }

    // ✅ Tính giá sau giảm
    const price = Number(product.price);
    const percent = Number(promo.percent);
    const discounted = Math.round(price * (1 - percent / 100));

    product.discountPrice = discounted;
    product.discountPercent = percent;
    product.lockPromotionId = promo._id;
    product.promotionApplied = {
      promoId: promo._id,
      percent,
      appliedAt: new Date(),
    };

    await product.save();
  }

  // 🔑 báo cho mongoose biết mảng đã thay đổi
  promo.markModified("assignedProducts");
  await promo.save();
}

function validatePayload(body) {
  if (!body.name) throw new Error("Thiếu tên chương trình.");
  if (!body.percent || body.percent < 1 || body.percent > 90)
    throw new Error("Phần trăm giảm không hợp lệ (1-90).");

  if (!body.type || !["once", "daily"].includes(body.type))
    throw new Error("Kiểu lịch không hợp lệ.");

  if (body.type === "once") {
    if (!body.once?.startAt || !body.once?.endAt)
      throw new Error("Cần startAt và endAt cho lịch 1 lần.");
    if (new Date(body.once.endAt) <= new Date(body.once.startAt))
      throw new Error("endAt phải sau startAt.");
  } else {
    const d = body.daily || {};
    if (!d.startDate || !d.startTime || !d.endTime)
      throw new Error("daily cần startDate, startTime, endTime.");
    if (d.endDate && new Date(d.endDate) < new Date(d.startDate))
      throw new Error("endDate phải >= startDate.");
  }
}

function computeStatus(promo) {
  const now = new Date();

  if (promo.type === "once") {
    const start = new Date(promo.once.startAt);
    const end = new Date(promo.once.endAt);

    if (now < start)
      return {
        ...promo.toObject(),
        status: "scheduled",
        currentlyActive: false,
      };
    if (now > end)
      return { ...promo.toObject(), status: "ended", currentlyActive: false };
    return { ...promo.toObject(), status: "active", currentlyActive: true };
  }

  if (promo.type === "daily") {
    const startDate = new Date(promo.daily.startDate);
    const endDate = promo.daily.endDate
      ? new Date(promo.daily.endDate).setHours(23, 59, 59, 999)
      : null;

    if (endDate && now > endDate)
      return { ...promo.toObject(), status: "ended", currentlyActive: false };
    if (now < startDate)
      return {
        ...promo.toObject(),
        status: "scheduled",
        currentlyActive: false,
      };

    const active = isActiveNow(promo);
    return {
      ...promo.toObject(),
      status: active ? "active" : "scheduled",
      currentlyActive: active,
    };
  }

  return { ...promo.toObject(), status: "scheduled", currentlyActive: false };
}

// ===== Controllers =====

exports.list = async (req, res) => {
  try {
    const { q } = req.query;

    let promotions = await Promotion.find().populate(
      "assignedProducts.product"
    );

    if (q) {
      const keyword = q.toLowerCase();
      promotions = promotions.filter((p) =>
        p.name.toLowerCase().includes(keyword)
      );
    }

    const result = promotions.map(computeStatus);

    // Gom tất cả productId
    const allProducts = [];
    result.forEach((promo) => {
      promo.assignedProducts.forEach((ap) => {
        if (ap.product && ap.product._id) {
          allProducts.push(ap.product._id.toString());
        }
      });
    });

    // Lấy tất cả reviews của các sản phẩm này
    const reviews = await Review.find({ product: { $in: allProducts } }).lean();

    // Gom review theo productId
    const reviewMap = {};
    reviews.forEach((r) => {
      const pid = r.product.toString();
      if (!reviewMap[pid]) reviewMap[pid] = [];
      reviewMap[pid].push(r);
    });

    // Gắn averageRating và reviewCount vào từng sản phẩm
    result.forEach((promo) => {
      promo.assignedProducts.forEach((ap) => {
        const product = ap.product;
        if (product && product._id) {
          const pid = product._id.toString();
          const productReviews = reviewMap[pid] || [];
          const reviewCount = productReviews.length;
          const averageRating = reviewCount
            ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;
          product.averageRating = Number(
            (Math.round(averageRating * 10) / 10).toFixed(1)
          );
          product.reviewCount = reviewCount;
        }
      });
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.detail = async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id).populate(
      "assignedProducts.product",
      "name price discountPrice status sku stock quantity"
    );
    if (!promo) return res.status(404).json({ message: "Không tìm thấy CTKM" });

    // Lọc sản phẩm hết hàng
    promo.assignedProducts = promo.assignedProducts.filter(
      (ap) => ap.product && (ap.product.quantity > 0 || ap.product.stock > 0)
    );

    // Gom tất cả productId
    const allProducts = [];
    promo.assignedProducts.forEach((ap) => {
      if (ap.product && ap.product._id) {
        allProducts.push(ap.product._id.toString());
      }
    });

    // Lấy tất cả reviews của các sản phẩm này
    const reviews = await Review.find({ product: { $in: allProducts } }).lean();

    // Gom review theo productId
    const reviewMap = {};
    reviews.forEach((r) => {
      const pid = r.product.toString();
      if (!reviewMap[pid]) reviewMap[pid] = [];
      reviewMap[pid].push(r);
    });

    // Gắn averageRating và reviewCount vào từng sản phẩm
    promo.assignedProducts.forEach((ap) => {
      const product = ap.product;
      if (product && product._id) {
        const pid = product._id.toString();
        const productReviews = reviewMap[pid] || [];
        const reviewCount = productReviews.length;
        const averageRating = reviewCount
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;
        product.averageRating = Number(
          (Math.round(averageRating * 10) / 10).toFixed(1)
        );
        product.reviewCount = reviewCount;
      }
    });

    res.json(computeStatus(promo));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.active = async (req, res) => {
  try {
    const promos = await Promotion.find()
      .populate("assignedProducts.product")
      .sort({ createdAt: -1 });
    const activePromos = promos
      .map(computeStatus)
      .filter((p) => p.status === "active");

    // Gom tất cả productId
    const allProducts = [];
    activePromos.forEach((promo) => {
      promo.assignedProducts.forEach((ap) => {
        if (ap.product && ap.product._id) {
          allProducts.push(ap.product._id.toString());
        }
      });
    });

    // Lấy tất cả reviews của các sản phẩm này
    const reviews = await Review.find({ product: { $in: allProducts } }).lean();

    // Gom review theo productId
    const reviewMap = {};
    reviews.forEach((r) => {
      const pid = r.product.toString();
      if (!reviewMap[pid]) reviewMap[pid] = [];
      reviewMap[pid].push(r);
    });

    // Gắn averageRating và reviewCount vào từng sản phẩm
    activePromos.forEach((promo) => {
      promo.assignedProducts.forEach((ap) => {
        const product = ap.product;
        if (product && product._id) {
          const pid = product._id.toString();
          const productReviews = reviewMap[pid] || [];
          const reviewCount = productReviews.length;
          const averageRating = reviewCount
            ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;
          product.averageRating = Number(
            (Math.round(averageRating * 10) / 10).toFixed(1)
          );
          product.reviewCount = reviewCount;
        }
      });
    });

    res.json(activePromos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    validatePayload(req.body);

    const created = await Promotion.create({
      name: req.body.name.trim(),
      // slug: slugify(req.body.name, { lower: true, strict: true }), // tự động sinh slug trong model nên code này không cần nữa
      productBannerImg: req.body.productBannerImg || "",
      bannerImg: req.body.bannerImg || "",
      promotionCardImg: req.body.promotionCardImg || "",
      percent: req.body.percent,
      type: req.body.type,
      once: req.body.once || undefined,
      daily: req.body.daily || undefined,
      hideWhenEnded: req.body.hideWhenEnded !== false,
      assignedProducts: Array.isArray(req.body.assignedProducts)
        ? req.body.assignedProducts.map((pid) => ({ product: pid }))
        : [],
      createdBy: req.user?._id,
    });

    // 🔁 reload lại doc đầy đủ
    const promo = await Promotion.findById(created._id);

    if (isActiveNow(promo)) {
      await applyPromotionImmediately(promo);
    }

    res.status(201).json(computeStatus(promo));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    const current = computeStatus(promo);
    if (
      current.currentlyActive &&
      req.body.percent &&
      req.body.percent !== promo.percent
    ) {
      return res.status(409).json({
        message: "Không thể đổi % khi CTKM đang hoạt động. Hãy dừng rồi sửa.",
      });
    }

    if (req.body.name) promo.name = req.body.name.trim();
    if (req.body.productBannerImg)
      promo.productBannerImg = req.body.productBannerImg;
    if (req.body.bannerImg) promo.bannerImg = req.body.bannerImg;
    if (req.body.promotionCardImg)
      promo.promotionCardImg = req.body.promotionCardImg;
    if (req.body.percent) promo.percent = req.body.percent;
    if (req.body.type) promo.type = req.body.type;
    if (req.body.once) promo.once = req.body.once;
    if (req.body.daily) promo.daily = req.body.daily;
    if (typeof req.body.hideWhenEnded === "boolean")
      promo.hideWhenEnded = req.body.hideWhenEnded;

    await promo.save();
    res.json(computeStatus(promo));
  } catch (e) {
    next(e);
  }
};

exports.partialUpdate = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    Object.assign(promo, req.body);
    await promo.save();

    res.json(computeStatus(promo));
  } catch (e) {
    next(e);
  }
};

exports.assignProducts = async (req, res) => {
  const { id } = req.params;
  const { productIds } = req.body;

  const promo = await Promotion.findById(id).populate(
    "assignedProducts.product"
  );
  if (!promo) return res.status(404).json({ message: "Promotion not found" });

  promo.assignedProducts = productIds.map((pid) => ({
    product: pid,
    backupDiscountPrice: null,
    backupDiscountPercent: null,
  }));

  await promo.save();

  // ✅ Nếu CTKM đang active thì apply luôn
  const current = computeStatus(promo);
  if (current.currentlyActive) {
    await applyPromotionImmediately(promo);
  }

  res.json(computeStatus(promo));
};

exports.unassignProduct = async (req, res, next) => {
  try {
    const { id, productId } = req.params;

    // Tìm CTKM
    const promo = await Promotion.findById(id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    // Xóa khỏi assignedProducts
    const result = await Promotion.updateOne(
      { _id: id },
      { $pull: { assignedProducts: { product: productId } } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không nằm trong CTKM." });
    }

    // ✅ Rollback product về giá gốc
    const product = await Product.findById(productId);
    if (product) {
      product.discountPrice = 0;
      product.discountPercent = 0;
      product.lockPromotionId = null;
      product.promotionApplied = null;
      await product.save();
    }

    res.json({ message: "Đã gỡ sản phẩm khỏi CTKM và rollback giá." });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: "Không tìm thấy CTKM." });
    }

    // ✅ Rollback bằng utils
    await rollbackPromotion(promo);

    // ✅ Xoá CTKM
    await promo.deleteOne();

    res.json({ message: "Đã xoá CTKM và rollback sản phẩm thành công." });
  } catch (e) {
    next(e);
  }
};

// Lấy sản phẩm để áp dụng CTKM
exports.getAvailableProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const match = {
      deleted: false,
      visible: true, // hiển thị
      status: { $in: ELIGIBLE_STATUSES }, // 🔥 status trong DB chính là còn hàng / nhiều hàng
      $and: [
        {
          $or: [
            { quantity: { $gt: 0 } },
            { "variations.quantity": { $gt: 0 } },
          ],
        },
        {
          $or: [
            { discountPrice: { $exists: false } },
            { discountPrice: 0 },
            { discountPrice: null },
          ],
        },
      ],
    };

    const totalCount = await Product.countDocuments(match);
    const products = await Product.find(match).skip(skip).limit(limit).lean();

    res.json({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo slug CTKM (dành cho trang frontend)
exports.productsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const promo = await Promotion.findOne({ slug }).populate(
      "assignedProducts.product"
    );

    if (!promo) {
      return res.status(404).json({ message: "Không tìm thấy CTKM" });
    }

    // Chỉ lấy sản phẩm còn hiển thị
    const products = promo.assignedProducts
      .map((ap) => ap.product)
      .filter((p) => p && !p.deleted && p.visible);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết CTKM theo slug (dành cho trang frontend)
exports.detailBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const promo = await Promotion.findOne({ slug }).populate(
      "assignedProducts.product",
      "name price discountPrice status sku stock quantity"
    );
    if (!promo) return res.status(404).json({ message: "Không tìm thấy CTKM" });

    res.json(computeStatus(promo));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
