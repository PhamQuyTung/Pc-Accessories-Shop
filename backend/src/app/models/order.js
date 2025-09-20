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

    subtotal: Number,
    tax: Number,
    discount: Number,
    shippingFee: Number,
    serviceFee: Number,
    totalAmount: Number,
    finalAmount: Number,
    paymentMethod: { type: String, enum: ["cod", "bank"], required: false },

    status: {
      type: String,
      enum: [
        "new", // Đơn mới
        "processing", // Đang xử lý
        "shipping", // Đang giao
        "completed", // Hoàn thành
        "cancelled", // Hủy bởi user/admin
        "deleted", // 👈 Soft delete
      ],
      default: "new",
    },

    cancelReason: { type: String, default: "" },

    shippingInfo: {
      name: String,
      phone: String,
      address: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
