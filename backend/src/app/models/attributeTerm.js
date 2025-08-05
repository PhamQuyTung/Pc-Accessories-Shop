// backend/src/app/models/attributeTerm.js
const mongoose = require("mongoose");

const attributeTermSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttributeTerm", attributeTermSchema);
