const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  /** ĐỔI TÊN Ở ĐÂY */
  specs: [
    { label: String, key: String, type: { type: String, default: "text" } },
  ],

  /** GIỮ NGUYÊN attributes */
  attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attribute" }],

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
});

module.exports = mongoose.model("Category", categorySchema);
