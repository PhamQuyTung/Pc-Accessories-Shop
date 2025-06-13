// routes/product.js
const express = require('express');
const Product = require("../app/models/product");

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products); // Gửi dữ liệu về cho React
    } catch (err) {
        res.status(500).json({ error: "Lỗi server" });
    }
});

module.exports = router;

