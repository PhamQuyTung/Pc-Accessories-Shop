function computeProductStatus(product, options = {}) {
  const importing = options.importing ?? product.importing;

  // Nếu sản phẩm đang nhập hàng → ưu tiên luôn
  if (importing) return "đang nhập hàng";

  let qty = 0;

  const hasVariations =
    Array.isArray(product.variations) && product.variations.length > 0;

  // Ưu tiên defaultVariation
  if (hasVariations && product.defaultVariantId) {
    const defaultVar = product.variations.find(
      (v) => v._id?.toString() === product.defaultVariantId.toString()
    );

    if (defaultVar) qty = Number(defaultVar.quantity) || 0;
  }

  // Nếu chưa có qty từ default → tính tổng
  if (qty === 0 && hasVariations) {
    qty = product.variations.reduce(
      (sum, v) => sum + (Number(v.quantity) || 0),
      0
    );
  }

  // Nếu vẫn chưa có → dùng product.quantity
  if (!hasVariations) {
    qty = Number(product.quantity) || 0;
  }

  // Chuẩn hóa
  if (isNaN(qty)) qty = 0;

  // ---- Logic trạng thái ----
  if (qty === 0) return "hết hàng";
  if (qty > 0 && qty < 5) return "sắp hết hàng";
  if (qty >= 5 && qty < 10) return "còn hàng";
  if (qty >= 10 && qty < 15) return "nhiều hàng";
  if (qty >= 15) return "sản phẩm mới";

  return "hết hàng";
}

module.exports = { computeProductStatus };
