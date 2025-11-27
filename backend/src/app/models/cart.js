const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variation_id: { type: ObjectId, ref: "Variation", default: null },
  quantity: { type: Number, required: true, default: 1 },
  isGift: { type: Boolean, default: false }, // 🆕 thêm cờ quà tặng
}, { timestamps: true });

// ✅ Composite unique index để 1 user có thể có nhiều sản phẩm, nhưng không trùng sp
cartSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
