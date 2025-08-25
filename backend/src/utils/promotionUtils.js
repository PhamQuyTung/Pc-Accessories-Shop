// utils/promotionUtils.js
const Product = require("../app/models/product");

/**
 * Rollback khuyến mãi cho toàn bộ sản phẩm thuộc 1 promotion
 * @param {Promotion} promo - document CTKM
 */
async function rollbackPromotion(promo) {
  if (!promo?.assignedProducts?.length) return;

  await Product.updateMany(
    { lockPromotionId: promo._id },
    {
      $set: {
        discountPrice: null,
        discountPercent: null,
        isOnPromotion: false,
        promotionId: null,
        lockPromotionId: null,
        promotionApplied: null,
      },
    }
  );
}

module.exports = { rollbackPromotion };
