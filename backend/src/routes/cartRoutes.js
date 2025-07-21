// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../app/controllers/cartController');
const authMiddleware = require('../app/middlewares/authMiddleware');

router.post('/add', authMiddleware, cartController.addToCart);
router.get('/', authMiddleware, cartController.getCart);
router.delete('/remove', authMiddleware, cartController.removeFromCart);
router.put("/update", authMiddleware, cartController.updateCartQuantity); 

module.exports = router;
