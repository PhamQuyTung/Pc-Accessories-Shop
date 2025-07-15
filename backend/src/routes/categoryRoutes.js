// routes/categoryRoutes.js
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

// Lấy danh sách danh mục có cấu trúc lồng nhau
router.get('/nested', categoryController.getNestedCategories);

// Lấy danh sách danh mục với đường dẫn đầy đủ (bao gồm danh mục cha)
router.get('/with-path', categoryController.getCategoriesWithFullPath);

// Lấy chi tiết danh mục theo ID (bao gồm schema)
router.get('/:id', categoryController.getCategoryById);

// Gán thuộc tính vào danh mục
router.post('/assign-attributes', categoryController.assignAttributes);

// Gỡ thuộc tính khỏi danh mục
router.post('/remove-attribute', categoryController.removeAttributeFromCategory);


module.exports = router;