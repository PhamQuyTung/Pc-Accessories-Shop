// utils/productStatus.js
/*
    Hàm này sẽ:

        Nhận vào product (có thể là doc của mongoose hoặc object JS).

        Tính tổng số lượng (quantity hoặc từ variations).

        Trả về mảng status y hệt logic bạn đang dùng.
*/
function computeProductStatus(product, options = {}) {
    // options: { importing: Boolean }
    const importing = options.importing ?? product.importing;

    const totalQty =
        Array.isArray(product.variations) && product.variations.length > 0
            ? product.variations.reduce((s, v) => s + (Number(v.quantity) || 0), 0)
            : Number(product.quantity) || 0;

    let statusArr = [];

    if (importing) statusArr.push('đang nhập hàng');
    else if (totalQty === 0) statusArr.push('hết hàng');
    else if (totalQty > 0 && totalQty < 15) statusArr.push('sắp hết hàng');
    else if (totalQty >= 15 && totalQty < 50) statusArr.push('còn hàng');
    else if (totalQty >= 50 && totalQty < 100) statusArr.push('nhiều hàng');
    else if (totalQty >= 100) statusArr.push('sản phẩm mới');

    return statusArr.length ? statusArr : ['không xác định'];
}

module.exports = { computeProductStatus };
