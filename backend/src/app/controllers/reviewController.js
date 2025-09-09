// controllers/reviewController.js
const Review = require("../models/review");

class ReviewController {
  // Lấy tất cả review theo sản phẩm
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const reviews = await Review.find({ product: productId })
        .populate("user", "name avatar") // chỉ populate các trường cần
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đánh giá:", err.message);
      res.status(500).json({
        message: "Lỗi khi lấy đánh giá",
        error: err.message,
      });
    }
  }

  // Lấy tất cả comment theo bài viết
  async getByPost(req, res) {
    try {
      const { postId } = req.params;
      const comments = await Review.find({ post: postId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });

      res.json(comments);
    } catch (err) {
      console.error("❌ Lỗi khi lấy comment:", err.message);
      res.status(500).json({
        message: "Lỗi khi lấy comment",
        error: err.message,
      });
    }
  }

  // Thêm comment cho blog
  async createForPost(req, res) {
    try {
      const { postId } = req.params;
      const { comment, rating } = req.body; // 👈 Lấy rating từ body
      const userId = req.userId;

      const review = new Review({
        user: userId,
        post: postId,
        comment,
        rating, // 👈 có thể null nếu user không nhập
      });

      await review.save();

      const populated = await review.populate("user", "name avatar"); // 👈 trả về kèm user info
      res.status(201).json(populated);
    } catch (error) {
      console.error("❌ Lỗi khi tạo comment:", error);
      res.status(500).json({ message: "Không thể tạo comment", error });
    }
  }

  // Thêm review mới
  async create(req, res) {
    try {
      console.log("req.body:", req.body); // 👈 Thêm dòng này
      const { productId, rating, comment } = req.body;
      const userId = req.userId; // ✅ đã được gán từ middleware xác thực

      const review = new Review({
        user: userId, // ✅ GÁN user ở đây
        product: productId,
        rating,
        comment,
      });

      await review.save();
      res.status(201).json(review);
    } catch (error) {
      console.error("❌ Lỗi khi tạo review:", error);
      res.status(500).json({ message: "Không thể tạo đánh giá", error });
    }
  }

  // Xoá review
  async remove(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const review = await Review.findById(id);
      if (!review)
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });

      if (!review.user.equals(userId)) {
        return res
          .status(403)
          .json({ message: "Không được xoá đánh giá của người khác" });
      }

      await Review.findByIdAndDelete(id);
      res.json({ message: "Đã xoá đánh giá" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xoá đánh giá", error: err });
    }
  }
}

module.exports = new ReviewController();
