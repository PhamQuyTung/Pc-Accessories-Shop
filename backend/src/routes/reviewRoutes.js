// backend/src/routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../app/controllers/reviewController");
const authMiddleware = require("../app/middlewares/authMiddleware");

// ✅ Sản phẩm
router.get("/product/:productId", reviewController.getByProduct);
router.post("/product/:productId", authMiddleware, reviewController.create);

// ✅ Blog (Post)
router.get("/post/:postId", reviewController.getByPost);
router.post("/post/:postId", authMiddleware, reviewController.createForPost);

router.delete("/:id", authMiddleware, reviewController.remove);

module.exports = router;
