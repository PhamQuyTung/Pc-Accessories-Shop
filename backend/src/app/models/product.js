// models/product.js
const mongoose = require('mongoose');
const slugify = require("slugify");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema({
    name: String,
    slug: String, 
    images: [String],
    price: Number,
    discountPrice: Number,
    quantity: { type: Number, default: 0 },
    status: [String],
    specs: { type: Object, default: {} }, // specs linh hoạt
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: String,
    reviews: [reviewSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false }, // Thêm trường này
});

// Tạo slug trước khi lưu vào DB
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('product', ProductSchema);

