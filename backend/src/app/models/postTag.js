const mongoose = require("mongoose");

const PostTagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostTag", PostTagSchema);
