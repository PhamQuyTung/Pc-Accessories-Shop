const Post = require("../../app/models/post");

// Lấy tất cả bài viết (có hỗ trợ filter category)
exports.getPosts = async (req, res) => {
  try {
    const filter = { status: "published" };

    // Nếu có query categoryId thì filter theo category
    if (req.query.categoryId) {
      filter.category = req.query.categoryId;
    }

    // Nếu có query slug thì filter theo slug (join sang Category)
    // cái này cần populate và filter bằng mongoose populate match
    // hoặc làm thêm route riêng getPostsByCategorySlug

    const posts = await Post.find(filter)
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy bài viết theo ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    // Regex tìm shortcode [product id="..."]
    const regex = /\[product id="(.*?)"\]/g;
    const productIds = [];
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      productIds.push(match[1]);
    }

    // Nếu có productIds thì query thêm
    let products = [];
    if (productIds.length > 0) {
      const Product = require("../../app/models/product");
      products = await Product.find({ _id: { $in: productIds } });
    }

    res.json({
      ...post.toObject(),
      embeddedProducts: products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      author: req.userId,
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
    })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug");

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

// Lấy bài viết nổi bật
exports.getFeaturedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published", isFeatured: true })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 })
      .limit(5); // giới hạn số lượng

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle featured
exports.toggleFeatured = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    // Đảo ngược trạng thái
    post.isFeatured = !post.isFeatured;
    await post.save();

    res.json({
      message: `Đã ${post.isFeatured ? "bật" : "tắt"} featured cho bài viết`,
      post,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy bài viết bản nháp
exports.getDraftPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "draft" })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy bài viết trong thùng rác
exports.getTrashPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "trash" })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
