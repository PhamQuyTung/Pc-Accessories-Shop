// utils/promotionUtils.js
const Product = require("../app/models/product");

/**
 * Rollback khuyến mãi cho toàn bộ sản phẩm thuộc 1 promotion
 * @param {Promotion} promo - document CTKM
 */
async function rollbackPromotion(promo) {
  const products = await Product.find({
    lockPromotionId: promo._id,
  });

  for (const product of products) {
    product.discountPrice = null;
    product.discountPercent = null;
    product.lockPromotionId = null;
    product.promotionApplied = null;

    if (product.variations?.length) {
      for (const variation of product.variations) {
        variation.discountPrice = null;
      }
      product.markModified("variations");
    }

    await product.save();
  }
}

module.exports = { rollbackPromotion };
