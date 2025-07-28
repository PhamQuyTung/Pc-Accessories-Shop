// models/favorite.js
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
        index: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
}, { timestamps: true });

favoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
