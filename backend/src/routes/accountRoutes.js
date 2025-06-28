// routes/accountRoutes.js
const express = require("express");
const router = express.Router();
const accountController = require("../app/controllers/accountController");

// Lấy danh sách tất cả accounts
router.get("/", accountController.getAllAccounts);

// Thêm các route khác nếu cần (tạo mới, xoá, cập nhật,...)

module.exports = router;
