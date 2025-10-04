const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");
const { computeProductStatus } = require("../../../../shared/productStatus");

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

// ================= Promotion Applied Schema =================
const promotionAppliedSchema = new mongoose.Schema(
  {
    promoId: { type: Schema.Types.ObjectId, ref: "Promotion", default: null },
    percent: { type: Number, default: 0 },
    appliedAt: { type: Date, default: null },
    soldCount: { type: Number, default: 0 }, // 👈 THÊM DÒNG NÀY
  },
  { _id: false }
);

// ================= Product Schema =================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  images: [String],
  price: { type: Number, default: null },
  discountPrice: { type: Number, default: null },
  quantity: { type: Number, default: 0 },

  // ❌ Không lưu status, chỉ tính động
  visible: { type: Boolean, default: true },
  specs: { type: Map, of: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: false, // optional
  },

  shortDescription: { type: String, default: "" },
  longDescription: { type: String, default: "" },

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
  },
  promotionApplied: {
    type: promotionAppliedSchema,
    default: null,
  },

  variations: [variationSchema],
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
  update.$set = {
    ...update.$set,
    updatedAt: Date.now(),
  };
  next();
});

// ================= Auto attach status =================
function attachStatus(docs) {
  if (!docs) return;
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      doc.status = computeProductStatus(doc);
    });
  } else {
    docs.status = computeProductStatus(docs);
  }
}

productSchema.post("find", attachStatus);
productSchema.post("findOne", attachStatus);
productSchema.post("findOneAndUpdate", attachStatus);
productSchema.post("findById", attachStatus);

module.exports = mongoose.model("Product", productSchema);
