// jobs/promotionEngine.js
// Engine áp/huỷ khuyến mãi (cron)

const cron = require("node-cron");
const Promotion = require("../app/models/promotion");
const Product = require("../app/models/product");
const { isActiveNow } = require("../utils/promotionTime");
const { rollbackPromotion } = require("../utils/promotionUtils");

/**
 * Áp CTKM cho 1 sản phẩm
 */
async function applyPromotionToProduct(promo, pp) {
  const product = await Product.findById(pp.product);
  if (!product) return;

  // Nếu đã bị khoá bởi CTKM khác => bỏ qua
  if (
    product.lockPromotionId &&
    String(product.lockPromotionId) !== String(promo._id)
  ) {
    return;
  }

  // ✅ Backup chỉ 1 lần: giá gốc + % gốc
  if (pp.backupPrice === undefined) {
    pp.backupPrice = Number(product.price); // giá gốc của sản phẩm
    promo.markModified("assignedProducts");
  }
  if (pp.backupDiscountPercent === undefined) {
    pp.backupDiscountPercent = Number(product.discountPercent || 0);
    promo.markModified("assignedProducts");
  }

  const basePrice = pp.backupPrice;
  const percent = Number(promo.percent);
  const discounted = Math.round(basePrice * (1 - percent / 100));

  console.log(">>> apply", {
    productId: product._id,
    basePrice,
    percent,
    discounted,
  });

  product.discountPrice = discounted;
  product.discountPercent = percent;
  product.lockPromotionId = promo._id;
  product.promotionApplied = {
    promoId: promo._id,
    percent,
    appliedAt: new Date(),
  };

  await product.save();
  await promo.save(); // lưu backup luôn
}

/**
 * Cron job tick
 */
async function tick() {
  const promotions = await Promotion.find({ status: { $ne: "ended" } });
  const now = new Date();

  console.log(
    "⏰ Tick:",
    now.toISOString(),
    " | Found:",
    promotions.length,
    "promotions"
  );

  for (const promo of promotions) {
    console.log("----");
    console.log(
      "📢 Checking promo:",
      promo._id,
      "| name:",
      promo.name,
      "| status:",
      promo.status
    );

    const shouldActive = isActiveNow(promo);
    let newStatus = promo.status;

    if (promo.type === "once") {
      console.log("⏳ Type: once");
      if (now < new Date(promo.once.startAt)) newStatus = "scheduled";
      else if (now >= new Date(promo.once.endAt)) newStatus = "ended";
      else newStatus = "active";
    } else {
      console.log("⏳ Type: daily");
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

    console.log(
      "👉 newStatus:",
      newStatus,
      "| currentlyActive:",
      promo.currentlyActive,
      "| transitionedToActive:",
      transitionedToActive,
      "| transitionedToInactive:",
      transitionedToInactive
    );

    // Nếu chuyển sang active → áp CTKM
    if (transitionedToActive) {
      console.log("🔥 Transition → ACTIVE. Applying promotion...");
      for (const pp of promo.assignedProducts) {
        try {
          await applyPromotionToProduct(promo, pp);
        } catch (e) {
          console.error("❌ apply fail", e);
        }
      }
    }

    // Nếu đang active → đảm bảo áp cho SP mới
    if (newStatus === "active") {
      console.log("✅ Promo is active. Force apply check...");
      for (const pp of promo.assignedProducts) {
        try {
          await applyPromotionToProduct(promo, pp);
        } catch (e) {
          console.error("❌ force apply fail", e);
        }
      }
    }

    // Nếu chuyển sang inactive/ended → rollback CTKM
    if (transitionedToInactive || newStatus === "ended") {
      console.log("🛑 Transition → INACTIVE/ENDED. Rollback promotion...");
      try {
        await rollbackPromotion(promo);
      } catch (e) {
        console.error("❌ rollback fail", e);
      }
    }

    // Luôn cập nhật cờ để đồng bộ
    promo.currentlyActive = newStatus === "active";
    promo.status = newStatus;
    await promo.save();
    console.log(
      "💾 Saved promo with status:",
      promo.status,
      "currentlyActive:",
      promo.currentlyActive
    );
  }
}

/**
 * Start cron job
 */
function startPromotionEngine() {
  cron.schedule("* * * * *", tick, { timezone: "Asia/Ho_Chi_Minh" });
  console.log("✅ Promotion Engine started (every minute).");
}

// 🚀 Gọi ngay khi file được require
startPromotionEngine();

module.exports = { startPromotionEngine, tick };
