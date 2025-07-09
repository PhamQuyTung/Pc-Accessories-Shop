// routes/category.js
const express = require('express');
const router = express.Router();
const categoryController = require('../app/controllers/categoryController');

// Lấy danh sách tất cả các danh mục
router.get('/', categoryController.getAllCategories);

// Tạo danh mục mới, cập nhật và xóa danh mục
router.post('/', categoryController.createCategory);
// Cập nhật và xóa danh mục theo ID
router.put('/:id', categoryController.updateCategory);
// Xóa danh mục theo ID
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;