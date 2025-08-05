// backend/src/app/models/attributeTerm.js
const mongoose = require("mongoose");

const attributeTermSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên hiển thị (VD: "Đỏ")
    slug: { type: String, required: true, unique: true }, // Dùng cho URL hoặc backend xử lý (VD: "do")

    // Tham chiếu đến Attribute cha
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },

    // Optional fields cho hiển thị tuỳ loại
    color: { type: String }, // VD: "#ff0000" cho type 'color'
    image: { type: String }, // VD: URL hình ảnh cho type 'image'
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttributeTerm", attributeTermSchema);
