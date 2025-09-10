const Post = require("../../app/models/post");

// Lấy tất cả bài viết
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name firstName lastName avatar") // 👈 thêm vào đây
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy bài viết theo ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name firstName lastName avatar"
    ); // 👈 lấy thông tin user

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      author: req.userId, // 👈 lấy từ middleware
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    res.json({ message: "Đã xóa bài viết" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
