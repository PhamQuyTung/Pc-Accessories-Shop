// middleware/checkProductLocked.js
const Product = require("../models/product");

module.exports = async function checkProductLocked(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (product?.lockPromotionId) {
      return res.status(423).json({
        message:
          "Sản phẩm đang thuộc chương trình khuyến mãi, vui lòng gỡ sản phẩm khỏi CTKM trước khi chỉnh sửa.",
      });
    }
    next();
  } catch (e) {
    next(e);
  }
};
