const express = require('express');
const router = express.Router();
const menuController = require('../app/controllers/menuController');

router.get('/', menuController.getAllMenus);
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
