const mongoose = require("mongoose");
const slugify = require("slugify");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostCategory",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostTag",
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

// ✅ Tự động tạo slug từ title nếu chưa có
PostSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
