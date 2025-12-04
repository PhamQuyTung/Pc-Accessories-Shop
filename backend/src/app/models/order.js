const mongoose = require("mongoose");
const removeVietnameseTones = require("../../utils/removeVietnameseTones");

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
        variation_id: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        productName: String,
        quantity: Number,
        price: Number,
        discountPrice: Number,
        finalPrice: Number,
        total: Number,
        gifts: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            quantity: Number,
          },
        ],
      },
    ],

    subtotal: Number,
    tax: Number,
    discount: Number,
    shippingFee: Number,
    serviceFee: Number,
    totalAmount: Number,
    finalAmount: Number,
    paymentMethod: {
      type: String,
      enum: ["cod", "bank", "momo"],
      required: false,
    },

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
      searchName: { type: String, index: true }, // 👈 thêm field này
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.shippingInfo?.name) {
    this.shippingInfo.searchName = removeVietnameseTones(
      this.shippingInfo.name
    );
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
