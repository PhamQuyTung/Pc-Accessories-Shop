const mongoose = require("mongoose");

const GiftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // tên quà (do admin đặt)
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String,
        quantity: Number,
        finalPrice: Number, // giá cuối (lấy từ ProductSelectModal)
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gift", GiftSchema);

