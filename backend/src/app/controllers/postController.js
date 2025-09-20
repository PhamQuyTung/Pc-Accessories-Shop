const Post = require("../../app/models/post");
const PostCategory = require("../models/postCategory");
const slugify = require("slugify");

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
    let { category, ...data } = req.body;

    // Nếu category là slug thì convert sang ObjectId
    if (
      category &&
      typeof category === "string" &&
      !category.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const catDoc = await PostCategory.findOne({ slug: category });
      if (!catDoc) return res.status(400).json({ error: "Category not found" });
      category = catDoc._id;
    }

    const newPost = new Post({
      ...data,
      category,
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
    let { category, ...data } = req.body;

    if (
      category &&
      typeof category === "string" &&
      !category.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const catDoc = await PostCategory.findOne({ slug: category });
      if (!catDoc) return res.status(400).json({ error: "Category not found" });
      category = catDoc._id;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { ...data, category },
      { new: true }
    )
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

// Lấy tất cả bài viết theo category.slug
exports.getPostsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Lấy category theo slug
    const category = await require("../models/postCategory").findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Lấy bài viết thuộc category đó
    const posts = await Post.find({
      status: "published",
      category: category._id,
    })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json({ posts, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả bài viết theo tag.slug
exports.getPostsByTagSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Lấy tag theo slug
    const Tag = require("../models/postTag");
    const tag = await Tag.findOne({ slug });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Lấy bài viết có tag đó
    const posts = await Post.find({ status: "published", tags: tag._id })
      .populate("author", "name firstName lastName avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json({ posts, tag });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lấy chi tiết bài viết theo categorySlug + postSlug
exports.getPostBySlug = async (req, res) => {
  try {
    const { categorySlug, postSlug } = req.params;

    const post = await Post.findOne({ slug: postSlug, status: "published" })
      .populate({
        path: "category",
        match: { slug: categorySlug },
        select: "name slug",
      })
      .populate("author", "name firstName lastName avatar")
      .populate("tags", "name slug");

    if (!post || !post.category) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Regex tìm shortcode [product id="..."]
    const regex = /\[product id="(.*?)"\]/g;
    const productIds = [];
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      productIds.push(match[1]);
    }

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

// searchPosts
exports.searchPosts = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) return res.json([]);

    const posts = await Post.find({
      status: "published", // ✅ chỉ lấy bài đã publish
      title: { $regex: q, $options: "i" },
    })
      .limit(parseInt(limit) || 5)
      .populate("category", "slug name")
      .select("title slug image category content");

    res.json(posts);
  } catch (error) {
    console.error("❌ searchPosts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy số liệu thống kê bài viết (total, publish, draft, trash)
exports.getStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: "published" });
    const draftPosts = await Post.countDocuments({ status: "draft" });
    const trashPosts = await Post.countDocuments({ status: "trash" });

    // Thống kê số bài viết theo tháng (12 tháng gần nhất)
    const monthlyPosts = await Post.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total: totalPosts,
      published: publishedPosts,
      draft: draftPosts,
      trash: trashPosts,
      monthlyPosts,
    });
  } catch (error) {
    console.error("❌ getStats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
