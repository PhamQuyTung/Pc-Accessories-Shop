// models/menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    link: { type: String, required: true }, // 👈 THÊM TRƯỜNG NÀY
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
