// models/product.js
const mongoose = require('mongoose');
const slugify = require("slugify");

const ProductSchema = new mongoose.Schema({
    name: String,
    slug: String, 
    images: [String],
    price: Number,
    discountPrice: Number,
    status: [String],
    specs: {
        cpu: String,
        vga: String,
        mainboard: String,
        ram: String,
        ssd: String,
    },
    description: String,
    rating: Number,
});

// Tạo slug trước khi lưu vào DB
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('product', ProductSchema); 

