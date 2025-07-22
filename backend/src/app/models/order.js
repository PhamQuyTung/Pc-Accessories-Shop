const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number, // Lưu lại giá tại thời điểm đặt hàng
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "pending" }, // pending | confirmed | shipped | delivered
    shippingInfo: {
      name: String,
      phone: String,
      address: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
