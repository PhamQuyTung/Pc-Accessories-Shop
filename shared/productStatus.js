// shared/productStatus.js
function computeProductStatus(product, options = {}) {
  const importing = options.importing ?? product.importing;

  const totalQtyRaw =
    Array.isArray(product.variations) && product.variations.length > 0
      ? product.variations.reduce((s, v) => s + (Number(v.quantity) || 0), 0)
      : Number(product.quantity) || 0;

  const totalQty = isNaN(totalQtyRaw) ? 0 : totalQtyRaw;

  let status = "hết hàng"; // mặc định

  if (importing) status = "đang nhập hàng";
  else if (totalQty === 0) status = "hết hàng";
  else if (totalQty > 0 && totalQty < 5) status = "sắp hết hàng";
  else if (totalQty >= 5 && totalQty < 10) status = "còn hàng";
  else if (totalQty >= 10 && totalQty < 15) status = "nhiều hàng";
  else if (totalQty >= 15) status = "sản phẩm mới";

  return status; // 👈 luôn string
}

module.exports = { computeProductStatus };
