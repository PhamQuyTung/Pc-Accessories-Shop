// routes/favoriteRouters.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../app/controllers/favoriteController');
const authMiddleware = require('../app/middlewares/authMiddleware');

router.post('/', authMiddleware, favoriteController.addFavorite);
router.delete('/:productId', authMiddleware, favoriteController.removeFavorite);
router.get('/:productId', authMiddleware, favoriteController.checkFavorite);
router.get('/', authMiddleware, favoriteController.getFavorites);
router.post('/toggle/:productId', authMiddleware, favoriteController.toggleFavorite);


module.exports = router;
