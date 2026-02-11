const Promotion = require("../models/promotion");
const Product = require("../models/product");
const { isActiveNow } = require("../../utils/promotionTime");
const { rollbackPromotion } = require("../../utils/promotionUtils");
const Review = require("../models/review");
const slugify = require("slugify");

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
      soldCount:
        typeof product.promotionApplied?.soldCount === "number"
          ? product.promotionApplied.soldCount
          : 0,
    };

    // ✅ Áp dụng cho variations
    if (product.variations && product.variations.length > 0) {
      if (!pp.variationBackups) {
        pp.variationBackups = [];
      }

      for (const variation of product.variations) {
        const percent = Number(promo.percent);
        const basePrice = Number(variation.price);
        const discounted = Math.round(basePrice * (1 - percent / 100));

        const existingBackup = pp.variationBackups.find(
          (vb) => String(vb.variationId) === String(variation._id),
        );

        if (!existingBackup) {
          pp.variationBackups.push({
            variationId: variation._id,
            backupPrice: basePrice,
            backupDiscountPrice: variation.discountPrice || 0,
          });
        }

        variation.discountPrice = discounted;
      }

      product.markModified("variations");
    }

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
      "assignedProducts.product",
    );

    if (q) {
      const keyword = q.toLowerCase();
      promotions = promotions.filter((p) =>
        p.name.toLowerCase().includes(keyword),
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
            (Math.round(averageRating * 10) / 10).toFixed(1),
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
      "name price discountPrice status sku stock quantity",
    );
    if (!promo) return res.status(404).json({ message: "Không tìm thấy CTKM" });

    // Lọc sản phẩm hết hàng
    promo.assignedProducts = promo.assignedProducts.filter(
      (ap) => ap.product && (ap.product.quantity > 0 || ap.product.stock > 0),
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
          (Math.round(averageRating * 10) / 10).toFixed(1),
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
            (Math.round(averageRating * 10) / 10).toFixed(1),
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
      productBannerImg: req.body.productBannerImg || "",
      bannerImg: req.body.bannerImg || "",
      promotionCardImg: req.body.promotionCardImg || "",
      headerBgColor: req.body.headerBgColor || "#003bb8", // ✅ THÊM
      headerTextColor: req.body.headerTextColor || "#ffee12", // ✅ THÊM
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
    if (req.body.headerBgColor) promo.headerBgColor = req.body.headerBgColor; // ✅ THÊM
    if (req.body.headerTextColor)
      promo.headerTextColor = req.body.headerTextColor; // ✅ THÊM
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
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    const promo = await Promotion.findById(id).populate(
      "assignedProducts.product",
    );
    if (!promo) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // =============================
    // 1️⃣ Chuẩn hoá & dedupe input
    // =============================
    const uniqueIds = Array.from(
      new Set(Array.isArray(productIds) ? productIds.map(String) : []),
    );

    // Map assignedProducts cũ theo productId
    const oldMap = new Map(
      promo.assignedProducts.map((pp) => [
        String(pp.product?._id || pp.product),
        pp,
      ]),
    );

    const oldIds = Array.from(oldMap.keys());

    // =============================
    // 2️⃣ Xác định SP bị gỡ → rollback
    // =============================
    const toRollback = oldIds.filter((oldId) => !uniqueIds.includes(oldId));

    for (const productId of toRollback) {
      const product = await Product.findById(productId);
      if (!product) continue;

      // ❗ CHỈ rollback nếu đang lock bởi CHÍNH promo này
      if (
        product.lockPromotionId &&
        String(product.lockPromotionId) !== String(promo._id)
      ) {
        continue;
      }

      const pp = oldMap.get(productId);

      // Rollback variations
      if (product.variations && pp?.variationBackups?.length) {
        for (const variation of product.variations) {
          const backup = pp.variationBackups.find(
            (vb) => String(vb.variationId) === String(variation._id),
          );
          if (backup) {
            variation.discountPrice = backup.backupDiscountPrice;
          }
        }
        product.markModified("variations");
      }

      // Rollback product-level
      product.discountPrice = null;
      product.discountPercent = null;
      product.lockPromotionId = null;
      product.promotionApplied = null;

      await product.save();
    }

    // =============================
    // 3️⃣ Load & validate sản phẩm mới
    // =============================
    const products = await Product.find({ _id: { $in: uniqueIds } }).lean();

    const missing = uniqueIds.filter(
      (pid) => !products.find((p) => String(p._id) === pid),
    );

    const invalid = [];

    for (const pid of uniqueIds) {
      const p = products.find((x) => String(x._id) === pid);
      if (!p) continue;

      if (p.deleted || !p.visible) {
        invalid.push({ id: pid, reason: "deleted or not visible" });
        continue;
      }

      // ❗ discountPrice = 0 là hợp lệ
      if (p.discountPrice && p.discountPrice > 0) {
        invalid.push({
          id: pid,
          reason: "already has product-level discount",
        });
        continue;
      }

      // ❗ Không cho SP có variations
      if (Array.isArray(p.variations) && p.variations.length > 0) {
        invalid.push({ id: pid, reason: "product has variations" });
        continue;
      }

      if (
        p.lockPromotionId &&
        String(p.lockPromotionId) !== String(promo._id)
      ) {
        invalid.push({
          id: pid,
          reason: "locked by another active promotion",
        });
        continue;
      }
    }

    const validIds = uniqueIds.filter(
      (pid) => !missing.includes(pid) && !invalid.some((i) => i.id === pid),
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        message: "Không có sản phẩm hợp lệ để gán vào CTKM.",
        missing,
        invalid,
      });
    }

    // =============================
    // 4️⃣ Merge với assignedProducts cũ để giữ nguyên backup nếu vẫn còn gán
    // =============================
    const merged = [];

    for (const pid of validIds) {
      const old = oldMap.get(pid);
      if (old) {
        merged.push(old);
      } else {
        merged.push({
          product: pid,
          backupDiscountPrice: null,
          backupDiscountPercent: null,
          variationBackups: [],
        });
      }
    }

    promo.assignedProducts = merged;

    await promo.save();

    // =============================
    // 5️⃣ Apply KM nếu CTKM đang active
    // =============================
    const current = computeStatus(promo);
    if (current.currentlyActive) {
      await applyPromotionImmediately(promo);
    }

    res.json(computeStatus(promo));
  } catch (err) {
    console.error("assignProducts error:", err);
    res.status(500).json({ message: err.message });
  }
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
      { $pull: { assignedProducts: { product: productId } } },
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không nằm trong CTKM." });
    }

    // ✅ Rollback product về giá gốc
    const product = await Product.findById(productId);
    if (product) {
      product.discountPrice = null;
      product.discountPercent = null;
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
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    // =========================
    // 1️⃣ Base điều kiện bắt buộc
    // =========================
    const match = {
      deleted: false,
      visible: true,
      quantity: { $gt: 0 },

      // Không có biến thể
      $expr: {
        $eq: [{ $size: { $ifNull: ["$variations", []] } }, 0],
      },

      // Không có giá KM
      $or: [
        { discountPrice: { $exists: false } },
        { discountPrice: null },
        { discountPrice: 0 },
      ],

      // Không bị lock CTKM khác
      lockPromotionId: null,
    };

    // =========================
    // 2️⃣ Nếu có search → thêm regex
    // =========================
    if (search) {
      match.name = { $regex: search, $options: "i" };
    }

    // =========================
    // 3️⃣ Query song song
    // =========================
    const [products, totalCount] = await Promise.all([
      Product.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(match),
    ]);

    res.json({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("getAvailableProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo slug CTKM (dành cho trang frontend)
exports.productsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const promo = await Promotion.findOne({ slug }).populate(
      "assignedProducts.product",
    );

    if (!promo) {
      return res.status(404).json({ message: "Không tìm thấy CTKM" });
    }

    // Chỉ lấy sản phẩm còn hiển thị
    const products = promo.assignedProducts
      .map((ap) => {
        if (!ap.product || ap.product.deleted || !ap.product.visible)
          return null;
        // Lấy soldCount từ chính DB (product.promotionApplied)
        let soldCount = 0;
        if (
          ap.product.promotionApplied &&
          ap.product.promotionApplied.promoId &&
          String(ap.product.promotionApplied.promoId) === String(promo._id)
        ) {
          soldCount = ap.product.promotionApplied.soldCount || 0;
        }
        return {
          ...ap.product.toObject(),
          soldCount,
          promoStatus: promo.status || "active",
        };
      })
      .filter(Boolean);

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
      "name price discountPrice status sku stock quantity",
    );
    if (!promo) return res.status(404).json({ message: "Không tìm thấy CTKM" });

    res.json(computeStatus(promo));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
