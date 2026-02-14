// models/Promotion.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

const PromotionProductSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    backupDiscountPrice: { type: Number, default: 0 },
    backupDiscountPercent: { type: Number, default: 0 },
    // ✅ THÊM: Backup cho variations
    variationBackups: [
      {
        variationId: { type: Schema.Types.ObjectId, required: true },
        backupPrice: { type: Number, default: 0 },
        backupDiscountPrice: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const PromotionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },

    productBannerImg: { type: String },
    bannerImg: { type: String },
    promotionCardImg: { type: String },
    bigBannerImg: { type: String },

    // ✅ THÊM: Lưu màu header
    headerBgColor: { type: String, default: "#003bb8" },
    headerTextColor: { type: String, default: "#ffee12" },

    percent: { type: Number, required: true, min: 1, max: 90 },

    type: { type: String, enum: ["once", "daily"], required: true },

    once: {
      startAt: { type: Date },
      endAt: { type: Date },
    },

    daily: {
      startDate: { type: Date },
      endDate: { type: Date },
      startTime: { type: String },
      endTime: { type: String },
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

// Index cho slug
PromotionSchema.index({ slug: 1 }, { unique: true });

// Tự động sinh slug trước khi lưu
// Middleware generate slug
PromotionSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    // 👉 Thay / và \ thành dấu gạch ngang
    const safeName = this.name.replace(/[\/\\]/g, "-");

    // 👉 Sinh slug từ tên
    let baseSlug = slugify(safeName, {
      lower: true,
      strict: true,
      locale: "vi",
      remove: /[*+~.()'"!:@]/g, // loại thêm ký tự không mong muốn
    });

    // 👉 Nếu slug rỗng thì fallback = timestamp
    if (!baseSlug) {
      baseSlug = Date.now().toString();
    }

    let slug = baseSlug;
    let i = 1;

    // 👉 Đảm bảo slug unique
    while (
      await mongoose.models.Promotion.findOne({
        slug,
        _id: { $ne: this._id }, // bỏ qua doc hiện tại khi update
      })
    ) {
      slug = `${baseSlug}-${i++}`;
    }

    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Promotion", PromotionSchema);
