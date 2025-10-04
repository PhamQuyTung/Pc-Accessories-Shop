// utils/normalizeProduct.js
function normalizeProduct(productDoc) {
  if (!productDoc) return null;

  const product = productDoc.toObject
    ? productDoc.toObject()
    : { ...productDoc };

  // Sold count từ promotionApplied
  product.soldCount = product.promotionApplied?.soldCount || 0;

  // Tính giá khuyến mãi (ưu tiên discountPrice hoặc promotionApplied)
  const price = product.price || 0;
  const discountPrice =
    product.discountPrice > 0
      ? product.discountPrice
      : product.promotionApplied?.percent
        ? Math.round(price * (1 - product.promotionApplied.percent / 100))
        : price;

  product.promotionPrice = discountPrice;

  // % giảm giá
  product.discountPercent =
    price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

  // Stock (có thể đồng bộ từ quantity)
  product.stock = product.quantity ?? 0;

  // 👉 Thêm trạng thái khuyến mãi
  const now = new Date();
  const promo = product.promotionApplied;

  if (promo?.startDate && promo?.endDate) {
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    if (now < start) {
      product.promoStatus = "scheduled"; // chưa bắt đầu
    } else if (now > end) {
      product.promoStatus = "ended"; // đã kết thúc
    } else {
      product.promoStatus = "active"; // đang diễn ra
    }
  } else if (promo?.promoId) {
    // Nếu không có start/endDate mà chỉ có promoId -> coi là active
    product.promoStatus = "active";
  } else {
    product.promoStatus = null; // không có CTKM
  }

  return product;
}

module.exports = { normalizeProduct };
