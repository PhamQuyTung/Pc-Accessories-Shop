const express = require("express");
const router = express.Router();
const reviewController = require("../app/controllers/reviewController");
const authMiddleware = require("../app/middlewares/authMiddleware");

router.get("/product/:productId", reviewController.getByProduct);
router.post("/product/:productId", authMiddleware, reviewController.create);
router.delete("/:id", authMiddleware, reviewController.remove);

module.exports = router;
