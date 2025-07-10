const Category = require('../models/category'); // Đường dẫn tới model category
const Product = require('../models/product'); // Đường dẫn tới model product

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ category: cat._id });
                return {
                    ...cat._doc,
                    productCount: count,
                };
            })
        );

        res.json(categoriesWithCount);
    } catch (err) {
        console.error('Lỗi khi lấy danh mục:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
};

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: 'Tạo danh mục thất bại', error: err });
    }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: 'Cập nhật danh mục thất bại' });
    }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(400).json({ message: 'Xóa danh mục thất bại' });
    }
};

// hàm tách category cha và danh sách con của nó
exports.getNestedCategories = async (req, res) => {
    try {
        const allCategories = await Category.find();

        const categoryMap = {};
        allCategories.forEach((cat) => {
            categoryMap[cat._id.toString()] = { ...cat._doc, children: [] };
        });

        const nestedCategories = [];
        allCategories.forEach((cat) => {
            const parentId = cat.parent?.toString();
            if (parentId && categoryMap[parentId]) {
                categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
            } else {
                nestedCategories.push(categoryMap[cat._id.toString()]);
            }
        });


        res.json(nestedCategories);
    } catch (err) {
        console.error('Lỗi lấy nested categories:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
