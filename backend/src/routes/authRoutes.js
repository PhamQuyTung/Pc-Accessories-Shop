// src/routes/authRoutes.js
const express = require('express');
const authController = require('../app/controllers/authController'); // Đảm bảo đúng đường dẫn
const validateMiddleware = require('../app/middlewares/validateMiddleware'); // Đảm bảo đúng đường dẫn

const router = express.Router();

// Đăng ký với validateMiddleware
router.post('/register', validateMiddleware.validateRegister, authController.register);

// Đăng nhập với validateMiddleware
router.post('/login', validateMiddleware.validateLogin, authController.login);

module.exports = router;
