const Promotion = require("../models/promotion");
const Product = require("../models/product");
const { isActiveNow } = require("../../utils/promotionTime");

// Chỉ cho phép gán sản phẩm đang "còn hàng trở lên"
const ELIGIBLE_STATUSES = ["còn hàng", "nhiều hàng", "sản phẩm mới"];

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
    const { status } = req.query;
    let query = {};

    if (status === "running") {
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === "scheduled") {
      query.startDate = { $gt: new Date() };
    } else if (status === "ended") {
      query.endDate = { $lt: new Date() };
    }

    const promotions = await Promotion.find(query).sort({ startDate: -1 });
    res.json(promotions);
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
    res.json(activePromos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    validatePayload(req.body);
    const promo = await Promotion.create({
      name: req.body.name.trim(),
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

exports.assignProducts = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    let { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách sản phẩm không hợp lệ." });
    }

    const products = await Product.find({ _id: { $in: productIds } }).select(
      "status lockPromotionId price discountPrice discountPercent"
    );

    const eligible = products.filter(
      (p) =>
        ELIGIBLE_STATUSES.includes(p.status) &&
        (!p.lockPromotionId || String(p.lockPromotionId) === String(promo._id))
    );

    const already = new Set(
      promo.assignedProducts.map((x) => String(x.product))
    );
    for (const p of eligible) {
      if (!already.has(String(p._id))) {
        promo.assignedProducts.push({
          product: p._id,
          backupDiscountPrice: Number(p.discountPrice || 0),
          backupDiscountPercent: Number(p.discountPercent || 0),
        });
      }
    }
    await promo.save();

    if (isActiveNow(promo)) {
      await require("../../jobs/promotionEngine").tick();
    }

    res.json({
      message: "Đã gán sản phẩm.",
      assignedCount: promo.assignedProducts.length,
    });
  } catch (e) {
    next(e);
  }
};

exports.unassignProduct = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    const productId = req.params.productId;
    const idx = promo.assignedProducts.findIndex(
      (pp) => String(pp.product) === productId
    );
    if (idx === -1)
      return res
        .status(404)
        .json({ message: "Sản phẩm không nằm trong CTKM." });

    if (isActiveNow(promo)) {
      await require("../../jobs/promotionEngine").tick();
    }

    promo.assignedProducts.splice(idx, 1);
    await promo.save();
    res.json({ message: "Đã gỡ sản phẩm khỏi CTKM." });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    const current = computeStatus(promo);
    if (current.currentlyActive) {
      return res.status(409).json({
        message:
          "CTKM đang hoạt động. Hãy chờ hết/đổi lịch hoặc gỡ sản phẩm trước khi xoá.",
      });
    }

    if (promo.assignedProducts.length > 0) {
      await require("../../jobs/promotionEngine").tick();
    }

    await Promotion.deleteOne({ _id: promo._id });
    res.json({ message: "Đã xoá CTKM." });
  } catch (e) {
    next(e);
  }
};

exports.getAvailableProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const match = {
      deleted: false,
      $or: [{ quantity: { $gt: 0 } }, { "variations.quantity": { $gt: 0 } }],
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
