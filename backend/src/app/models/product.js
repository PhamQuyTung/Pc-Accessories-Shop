// models/product.js
const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const slugify = require("slugify");

// ================= Review Schema =================
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ================= Variation Schema =================
const variationSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true }, // Không unique toàn DB để tránh lỗi cross-product
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    quantity: { type: Number, default: 0 },
    images: [String],
    attributes: [
      {
        attrId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        termId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeTerm",
          required: true,
        },
      },
    ],
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      unit: { type: String, default: "cm" },
    },
    weight: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: "kg" },
    },
  },
  { _id: true }
);

// ================= Product Schema =================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  images: [String],
  price: { type: Number, default: null },
  discountPrice: { type: Number, default: null },
  quantity: { type: Number, default: 0 },
  status: [String],
  visible: { type: Boolean, default: true },
  specs: { type: Map, of: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: { type: String, required: true },
  description: String,

  // 🔹 Thuộc tính áp dụng chung cho sản phẩm (giữ reference)
  attributes: [
    {
      attrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true,
      },
      termIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttributeTerm" }],
    },
  ],

  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    unit: { type: String, default: "cm" },
  },
  weight: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: "kg" },
  },

  lockPromotionId: {
    type: Schema.Types.ObjectId,
    ref: "Promotion",
    default: null,
  }, // đang bị khóa bởi CTKM nào
  promotionApplied: {
    promoId: { type: Schema.Types.ObjectId, ref: "Promotion", default: null },
    percent: { type: Number, default: 0 },
    appliedAt: { type: Date, default: null },
  },

  variations: [variationSchema],
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

// ================= Slug Middleware =================
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  update.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", productSchema);
