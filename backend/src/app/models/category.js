// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true }, // ví dụ: 'pc', 'laptop-gaming'
    description: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);    