// backend/src/app/models/attribute.js
const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Hiển thị: "CPU", "RAM"
    key: { type: String, required: true, unique: true }, // Tên khóa: "cpu", "ram"
    type: { type: String, enum: ['text', 'number', 'select'], default: 'text' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attribute', attributeSchema);
