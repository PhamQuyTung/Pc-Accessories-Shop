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
      type: String,
      default: "admin", // sau này có thể liên kết User model
    },
    category: {
      type: String,
      default: "Uncategorized",
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "trash"],
      default: "draft",
    },
    image: {
      type: String, // Lưu URL hoặc đường dẫn ảnh
      default: "",  // để trống nếu chưa có
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
