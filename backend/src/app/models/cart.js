// models/cart.js
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: ObjectId,
      ref: "Account",
      required: true,
    },

    product_id: {
      type: ObjectId,
      ref: "Product",
      required: true,
    },

    // ❌ Không ref "Variation" vì variation là subdocument trong Product
    variation_id: {
      type: ObjectId,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    isGift: {
      type: Boolean,
      default: false,
    },

    // when true, this cart entry was added as a gift selection
    parentProductId: {
      type: ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ FIX: Unique index phải bao gồm isGift để phân biệt normal vs gift items
// - Normal items: user_id + product_id + variation_id + isGift=false
// - Gift items: user_id + product_id + isGift=true (có thể có parentProductId khác nhau)
cartSchema.index(
  { user_id: 1, product_id: 1, variation_id: 1, isGift: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Cart", cartSchema);
