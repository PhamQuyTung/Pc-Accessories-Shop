const PostTag = require("../models/postTag");

// Lấy tất cả tags
exports.getTags = async (req, res) => {
  try {
    const tags = await PostTag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo tag mới
exports.createTag = async (req, res) => {
  try {
    const newTag = new PostTag(req.body);
    const saved = await newTag.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật tag
exports.updateTag = async (req, res) => {
  try {
    const updated = await PostTag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Không tìm thấy thẻ" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa tag
exports.deleteTag = async (req, res) => {
  try {
    const deleted = await PostTag.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy thẻ" });
    res.json({ message: "Đã xóa thẻ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tag theo slug
exports.getTagBySlug = async (req, res) => {
  try {
    const tag = await PostTag.findOne({ slug: req.params.slug });
    if (!tag) {
      return res.status(404).json({ error: "Không tìm thấy thẻ" });
    }
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
