// utils/promotionUtils.js
const Product = require("../app/models/product");

/**
 * Rollback khuyến mãi cho toàn bộ sản phẩm thuộc 1 promotion
 * @param {Promotion} promo - document CTKM
 */
async function rollbackPromotion(promo) {
  if (!promo?.assignedProducts?.length) return;

  for (const pp of promo.assignedProducts) {
    const product = await Product.findById(pp.product);
    if (!product) continue;

    // Rollback variations
    if (product.variations && pp.variationBackups) {
      for (const variation of product.variations) {
        const backup = pp.variationBackups.find(
          (vb) => String(vb.variationId) === String(variation._id)
        );
        if (backup) {
          variation.discountPrice = backup.backupDiscountPrice;
        }
      }
      product.markModified("variations");
    }

    // Rollback product level
    product.discountPrice = null;
    product.discountPercent = null;
    product.isOnPromotion = false;
    product.promotionId = null;
    product.lockPromotionId = null;
    product.promotionApplied = null;

    await product.save();
  }
}

module.exports = { rollbackPromotion };
