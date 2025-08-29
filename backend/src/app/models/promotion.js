// models/Promotion.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PromotionProductSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // Lưu lại discount trước khi áp khuyến mãi để hoàn nguyên
    backupDiscountPrice: { type: Number, default: 0 },
    backupDiscountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const PromotionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    productBannerImg: { type: String}, // URL ảnh background (dùng cho carousel / section lớn)
    bannerImg: { type: String }, // URL ảnh banner (dùng cho header / card nhỏ bên trái)
    promotionCardImg: { type: String }, // URL ảnh hiển thị cho card nhỏ sản phẩm bên phải

    percent: { type: Number, required: true, min: 1, max: 90 },

    // Kiểu lịch: once (1 lần), daily (lặp hằng ngày)
    type: { type: String, enum: ["once", "daily"], required: true },

    // Lịch 1 lần
    once: {
      startAt: { type: Date },
      endAt: { type: Date },
    },

    // Lịch lặp hằng ngày (trong khoảng ngày)
    daily: {
      startDate: { type: Date }, // ngày bắt đầu (00:00)
      endDate: { type: Date }, // ngày kết thúc (23:59) - optional
      startTime: { type: String }, // HH:mm
      endTime: { type: String }, // HH:mm (có thể qua đêm - > start > end)
    },

    assignedProducts: [PromotionProductSchema],

    hideWhenEnded: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "ended"],
      default: "draft",
    },
    currentlyActive: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PromotionSchema.index({
  status: 1,
  currentlyActive: 1,
  "once.startAt": 1,
  "once.endAt": 1,
});

module.exports = mongoose.model("Promotion", PromotionSchema);
