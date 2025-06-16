const Product = require("../models/product");

const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save(); // tự sinh slug nhờ middleware
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Tạo sản phẩm thất bại" });
    }
};
