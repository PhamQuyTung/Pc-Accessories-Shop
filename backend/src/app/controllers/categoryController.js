const Category = require('../models/category'); // Đường dẫn tới model category

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
};