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

  for (const promo of promotions) {
    const shouldActive = isActiveNow(promo);

    // Cập nhật trạng thái top-level
    let newStatus = promo.status;
    if (promo.type === "once") {
      const now = new Date();
      if (now < new Date(promo.once.startAt)) newStatus = "scheduled";
      else if (now >= new Date(promo.once.endAt)) newStatus = "ended";
      else newStatus = "active";
    } else {
      // daily: active nếu đang nằm trong khung giờ; nếu đã hết endDate -> ended; nếu chưa tới startDate -> scheduled; còn lại scheduled/active tuỳ giờ
      const today = new Date();
      if (
        promo.daily.endDate &&
        today > new Date(promo.daily.endDate).setHours(23, 59, 59, 999)
      ) {
        newStatus = "ended";
      } else if (!shouldActive) {
        // Chưa tới giờ hoặc ngoài giờ
        newStatus =
          promo.daily.startDate && today < new Date(promo.daily.startDate)
            ? "scheduled"
            : "scheduled";
      } else {
        newStatus = "active";
      }
    }

    const transitionedToActive = shouldActive && !promo.currentlyActive;
    const transitionedToInactive = !shouldActive && promo.currentlyActive;

    // Áp hoặc gỡ trên sản phẩm
    if (transitionedToActive) {
      for (const pp of promo.assignedProducts) {
        try {
          await applyPromotionToProduct(promo, pp);
        } catch (e) {
          console.error("apply fail", e);
        }
      }
    }
    if (transitionedToInactive) {
      for (const pp of promo.assignedProducts) {
        try {
          await removePromotionFromProduct(promo, pp);
        } catch (e) {
          console.error("remove fail", e);
        }
      }
    }

    // Cập nhật flags
    promo.currentlyActive = shouldActive;
    promo.status = newStatus;
    await promo.save();
  }
}

// Chạy mỗi phút
function startPromotionEngine() {
  cron.schedule("* * * * *", tick, { timezone: "Asia/Ho_Chi_Minh" });
  console.log("✅ Promotion Engine started (every minute).");
}

module.exports = { startPromotionEngine, tick };
