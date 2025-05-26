const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "account",
    },
    token: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 60 * 60 * 24 * 7 
    }, // Token hết hạn sau 7 ngày
});

module.exports = mongoose.model("Token", tokenSchema);
