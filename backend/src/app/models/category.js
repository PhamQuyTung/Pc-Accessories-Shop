// models/category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    specs: [
      {
        label: String, // CPU
        key: String, // cpu
        type: { type: String, default: "text" }, // text | number | select
        icon: { type: String, default: "default" }, // ✅ QUAN TRỌNG
      },
    ],

    attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attribute" }],

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
