// models/promotionGift.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PromotionGiftSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    discountType: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },

    // ✅ Sản phẩm chính
    conditionProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    // ✅ Danh sách sản phẩm mua kèm
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    link: { type: String, default: "" },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromotionGift", PromotionGiftSchema);
