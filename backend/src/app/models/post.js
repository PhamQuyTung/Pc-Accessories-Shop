const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account", // 👈 model account
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostCategory", // 👈 model PostCategory
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostTag", // 👈 model PostTag
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "trash"],
      default: "draft",
    },
    image: {
      type: String,
      default: "",
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
