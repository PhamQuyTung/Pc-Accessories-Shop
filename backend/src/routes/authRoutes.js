// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../app/middlewares/async.middleware');

const { login, register, logout, verifyToken } = require('../app/controllers/authController');

// Login route
router.route('/register').post(asyncMiddleware(register));
router.route('/login').post(asyncMiddleware(login));
router.route('/logout').post(asyncMiddleware(logout));

// Verify token route
router.route('/verify-token').get(asyncMiddleware(verifyToken));

module.exports = router;
