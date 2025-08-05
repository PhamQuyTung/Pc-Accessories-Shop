// backend/src/app/models/attribute.js
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
    color: String, // cho type 'color'
    image: String, // cho type 'image'
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ví dụ: "CPU", "Màu sắc"
  key: { type: String, required: true, unique: true }, // Ví dụ: "cpu", "color"
  type: {
    type: String,
    enum: ["text", "number", "select", "button", "color", "image"],
    default: "text",
  },
  options: [optionSchema], // áp dụng cho các loại có lựa chọn
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attribute", attributeSchema);
