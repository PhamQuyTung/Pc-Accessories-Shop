const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const authMiddleware = require("../app/middlewares/authMiddleware");

router.post("/checkout", authMiddleware, orderController.checkoutOrder);
router.get("/", authMiddleware, orderController.getUserOrders);

module.exports = router;
