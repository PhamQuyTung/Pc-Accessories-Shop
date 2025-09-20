// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/orderController");
const authMiddleware = require("../app/middlewares/authMiddleware");

router.post("/checkout", authMiddleware, orderController.checkoutOrder);
router.post("/:id/cancel", authMiddleware, orderController.cancelOrder);
router.delete("/:id", authMiddleware, orderController.deleteOrder);
router.get("/", authMiddleware, orderController.getUserOrders);
router.get("/all", authMiddleware, orderController.getAllOrders);


module.exports = router;
