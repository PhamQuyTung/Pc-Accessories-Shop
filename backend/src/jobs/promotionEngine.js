// jobs/promotionEngine.js
// Engine áp/huỷ khuyến mãi (cron)
const cron = require("node-cron");
const Promotion = require("../app/models/promotion");
const Product = require("../app/models/product");
const { isActiveNow } = require("../utils/promotionTime");

async function applyPromotionToProduct(promo, pp) {
  const product = await Product.findById(pp.product);
  if (!product) return;

  // Nếu đã bị khoá bởi CTKM khác => bỏ qua để an toàn
  if (
    product.lockPromotionId &&
    String(product.lockPromotionId) !== String(promo._id)
  )
    return;

  // Backup 1 lần khi chưa có
  if (!pp.backupDiscountPrice && pp.backupDiscountPrice !== 0)
    pp.backupDiscountPrice = Number(product.discountPrice || 0);
  if (!pp.backupDiscountPercent && pp.backupDiscountPercent !== 0)
    pp.backupDiscountPercent = Number(product.discountPercent || 0);

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

async function removePromotionFromProduct(promo, pp) {
  const product = await Product.findById(pp.product);
  if (!product) return;

  // Chỉ gỡ nếu CTKM hiện tại trên sản phẩm là CTKM này
  if (
    !product.lockPromotionId ||
    String(product.lockPromotionId) !== String(promo._id)
  )
    return;

  product.discountPrice = Number(pp.backupDiscountPrice || 0);
  product.discountPercent = Number(pp.backupDiscountPercent || 0);
  product.lockPromotionId = null;
  product.promotionApplied = { promoId: null, percent: 0, appliedAt: null };
  await product.save();
}

async function tick() {
  const promotions = await Promotion.find({ status: { $ne: "ended" } });

  const now = new Date();

  for (const promo of promotions) {
    const shouldActive = isActiveNow(promo);
    let newStatus = promo.status;

    if (promo.type === "once") {
      if (now < new Date(promo.once.startAt)) newStatus = "scheduled";
      else if (now >= new Date(promo.once.endAt)) newStatus = "ended";
      else newStatus = "active";
    } else {
      // daily
      const startDate = new Date(promo.daily.startDate);
      const endDate = promo.daily.endDate
        ? new Date(promo.daily.endDate).setHours(23, 59, 59, 999)
        : null;

      if (endDate && now > endDate) {
        newStatus = "ended";
      } else if (now < startDate) {
        newStatus = "scheduled";
      } else {
        newStatus = shouldActive ? "active" : "scheduled";
      }
    }

    const transitionedToActive =
      newStatus === "active" && promo.currentlyActive === false;
    const transitionedToInactive =
      newStatus !== "active" && promo.currentlyActive === true;

    // Nếu chuyển sang active → áp CTKM
    if (transitionedToActive) {
      for (const pp of promo.assignedProducts) {
        try {
          await applyPromotionToProduct(promo, pp);
        } catch (e) {
          console.error("apply fail", e);
        }
      }
    }

    // Nếu chuyển sang inactive/ended → gỡ CTKM
    if (transitionedToInactive || newStatus === "ended") {
      for (const pp of promo.assignedProducts) {
        try {
          await removePromotionFromProduct(promo, pp);
        } catch (e) {
          console.error("remove fail", e);
        }
      }
    }

    // Luôn cập nhật cờ để đồng bộ
    promo.currentlyActive = newStatus === "active";
    promo.status = newStatus;
    await promo.save();
  }
}

// Chạy mỗi phút
function startPromotionEngine() {
  cron.schedule("* * * * *", tick, { timezone: "Asia/Ho_Chi_Minh" });
  console.log("✅ Promotion Engine started (every minute).");
}

// 🚀 Gọi ngay khi file được require
startPromotionEngine();

module.exports = { startPromotionEngine, tick };
