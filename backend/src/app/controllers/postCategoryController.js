const PostCategory = require("../models/postCategory");
const Post = require("../models/post");

// Lấy tất cả categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await PostCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new PostCategory(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await PostCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Không tìm thấy chuyên mục" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await PostCategory.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Không tìm thấy chuyên mục" });
    res.json({ message: "Đã xóa chuyên mục" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh mục theo slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await PostCategory.findOne({ slug: req.params.slug });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lấy danh mục kèm tổng số bài viết (chỉ published)
exports.getCategoriesWithCount = async (req, res) => {
  try {
    const categories = await PostCategory.aggregate([
      {
        $lookup: {
          from: "posts",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$category", "$$categoryId"] } } },
            { $match: { status: "published" } }, // 👈 chỉ lấy published
          ],
          as: "posts",
        },
      },
      {
        $addFields: {
          total: { $size: "$posts" },
        },
      },
      {
        $project: {
          posts: 0,
        },
      },
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
