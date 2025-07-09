// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    /**
     * Mỗi category có thể định nghĩa danh sách thông số riêng
     * Ví dụ: Laptop -> CPU, RAM, SSD | Màn hình -> Kích thước, Tần số quét,...
     */
    schema: [
        {
            label: { type: String, required: true }, // Tên hiển thị ví dụ "CPU"
            key: { type: String, required: true },   // Tên khóa ví dụ "cpu"
            type: { type: String, default: 'text' }, // Kiểu input: text, number, select...
        }
    ]
});


module.exports = mongoose.model('Category', categorySchema);    