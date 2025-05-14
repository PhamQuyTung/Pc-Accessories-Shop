// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { login, register } = require('../app/controllers/authController');

// Login route
router.route('/register').post(register);

module.exports = router;
