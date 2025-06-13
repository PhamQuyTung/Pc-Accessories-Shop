// models/product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    discountPrice: Number,
    status: [String],
    specs: {
        cpu: String,
        vga: String,
        mainboard: String,
        ram: String,
        ssd: String,
    },
    rating: Number,
});

module.exports = mongoose.model('product', ProductSchema); 

