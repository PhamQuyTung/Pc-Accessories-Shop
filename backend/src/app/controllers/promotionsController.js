const Promotion = require("../models/promotion");
const Product = require("../models/product");
const { isActiveNow } = require("../../utils/promotionTime");

// Chỉ cho phép gán sản phẩm đang "còn hàng trở lên"
const ELIGIBLE_STATUSES = ["còn hàng", "nhiều hàng", "sản phẩm mới"]; // tuỳ hệ thống bạn

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
    // endDate optional; nếu có, phải >= startDate
    if (d.endDate && new Date(d.endDate) < new Date(d.startDate))
      throw new Error("endDate phải >= startDate.");
  }
}

exports.list = async (req, res, next) => {
  try {
    const { status, includeEnded, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (!includeEnded || includeEnded === "false")
      filter.status = { $ne: "ended" };
    if (q) filter.name = { $regex: q, $options: "i" };

    const promos = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "name percent type status currentlyActive once daily assignedProducts hideWhenEnded createdAt"
      );

    res.json(promos);
  } catch (e) {
    next(e);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id)
      .populate(
        "assignedProducts.product",
        "name price discountPrice status sku stock quantity"
      )
      .lean(); // trả về object JS để dễ thao tác

    if (!promo) {
      return res.status(404).json({ message: "Không tìm thấy CTKM." });
    }

    console.log("Before filter:", promo.assignedProducts);

    // Lọc bỏ sản phẩm hết hàng hoặc bị null
    const beforeCount = promo.assignedProducts.length;

    promo.assignedProducts = promo.assignedProducts.filter(
      (ap) => ap.product && (ap.product.quantity > 0 || ap.product.stock > 0)
    );

    const removedCount = beforeCount - promo.assignedProducts.length;

    console.log(
      `[Promotion ${promo._id}] Đã loại ${removedCount} sản phẩm hết hàng.`
    );

    res.json(promo);
  } catch (e) {
    next(e);
  }
};

exports.active = async (req, res, next) => {
  try {
    const now = new Date();
    const promos = await Promotion.find({
      $or: [
        { status: "active" }, // luôn show CTKM đang chạy
        { status: "ended", hideWhenEnded: false }, // chỉ show ended nếu ko ẩn
      ],
    })
      .populate("assignedProducts.product") // lấy thông tin SP
      .sort({ createdAt: -1 })
      .limit(3); // tuỳ bạn muốn show bao nhiêu block CTKM

    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    console.log(req.body);
    validatePayload(req.body);
    const promo = await Promotion.create({
      name: req.body.name.trim(),
      percent: req.body.percent,
      type: req.body.type,
      once: req.body.once || undefined,
      daily: req.body.daily || undefined,
      hideWhenEnded: req.body.hideWhenEnded !== false,
      status: "scheduled",
      assignedProducts: Array.isArray(req.body.assignedProducts)
        ? req.body.assignedProducts.map((pid) => ({ product: pid }))
        : [],
      createdBy: req.user?._id,
    });
    res.status(201).json(promo.toObject());
  } catch (e) {
    console.error("❌ Lỗi tạo CTKM:", e);
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    // Không cho đổi percent khi đang active để tránh nhấp nháy giá (có thể cho phép nếu bạn muốn)
    if (
      promo.currentlyActive &&
      req.body.percent &&
      req.body.percent !== promo.percent
    ) {
      return res.status(409).json({
        message: "Không thể đổi % khi CTKM đang hoạt động. Hãy dừng rồi sửa.",
      });
    }

    // Cập nhật các trường an toàn
    if (req.body.name) promo.name = req.body.name.trim();
    if (req.body.percent) promo.percent = req.body.percent;
    if (req.body.type) promo.type = req.body.type;
    if (req.body.once) promo.once = req.body.once;
    if (req.body.daily) promo.daily = req.body.daily;
    if (typeof req.body.hideWhenEnded === "boolean")
      promo.hideWhenEnded = req.body.hideWhenEnded;

    await promo.save();
    res.json(promo);
  } catch (e) {
    next(e);
  }
};

exports.partialUpdate = async (req, res, next) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo)
      return res.status(404).json({ message: "Không tìm thấy CTKM." });

    Object.assign(promo, req.body); // chỉ cập nhật field gửi lên
    await promo.save();

    res.json(promo);
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

    console.log(
      "products:",
      products.map((p) => ({
        id: p._id,
        status: p.status,
        lockPromotionId: p.lockPromotionId,
      }))
    );
    console.log("ELIGIBLE_STATUSES:", ELIGIBLE_STATUSES);
    console.log("promoId:", promo._id);

    // Chỉ chọn sp đủ điều kiện + chưa bị CTKM khác khoá
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

    // Nếu đang active -> áp ngay
    if (isActiveNow(promo)) {
      for (const pp of promo.assignedProducts) {
        if (productIds.includes(String(pp.product))) {
          await require("../../jobs/promotionEngine").tick(); // đơn giản gọi tick để áp ngay
          break;
        }
      }
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

    // Nếu đang active -> gỡ trước
    const {
      removePromotionFromProduct,
    } = require("../../jobs/promotionEngine"); // nếu tách export
    if (isActiveNow(promo)) {
      // gọi tick để đảm bảo sync
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

    // An toàn: nếu đang active -> yêu cầu dừng (đợi engine gỡ) rồi xoá
    if (promo.currentlyActive) {
      return res.status(409).json({
        message:
          "CTKM đang hoạt động. Hãy chờ hết/đổi lịch hoặc gỡ sản phẩm trước khi xoá.",
      });
    }

    // Nếu còn sản phẩm gán -> khôi phục trước rồi xoá
    if (promo.assignedProducts.length > 0) {
      await require("../../jobs/promotionEngine").tick();
      // sau tick, nếu không active nữa, xoá an toàn
    }

    await Promotion.deleteOne({ _id: promo._id });
    res.json({ message: "Đã xoá CTKM." });
  } catch (e) {
    next(e);
  }
};

// Lấy sản phẩm đủ điều kiện gán vào khuyến mãi
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
