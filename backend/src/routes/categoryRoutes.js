// routes/category.js
const express = require('express');
const router = express.Router();
const categoryController = require('../app/controllers/categoryController');

// Lấy danh sách tất cả các danh mục
router.get('/', categoryController.getAllCategories);

module.exports = router;