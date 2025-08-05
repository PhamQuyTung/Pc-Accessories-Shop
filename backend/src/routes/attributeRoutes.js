// backend/src/routes/attributeRoutes.js
const express = require('express');
const router = express.Router();
const attributeController = require('../app/controllers/attributeController');

router.get('/', attributeController.getAll);
router.get('/:id', attributeController.getAttributeById);
router.post('/', attributeController.create);
router.put('/:id', attributeController.update);
router.delete('/:id', attributeController.remove);

module.exports = router;
