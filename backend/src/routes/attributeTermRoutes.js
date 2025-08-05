const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middlewares/authMiddleware");
const attributeTermController = require("../app/controllers/attributeTermController");

// Lấy danh sách chủng loại cho 1 attribute
router.get("/:attributeId", attributeTermController.getAttributeTerms);

// Thêm chủng loại
router.post("/:attributeId", authMiddleware, attributeTermController.createAttributeTerm);

// Xoá một chủng loại
router.delete("/:id", authMiddleware, attributeTermController.deleteAttributeTerm);

// Cập nhật chủng loại
router.put("/:id", authMiddleware, attributeTermController.updateAttributeTerm);


module.exports = router;
