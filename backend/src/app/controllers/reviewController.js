// controllers/reviewController.js
const Review = require("../models/review");

class ReviewController {
  /** ================================
   *  LẤY REVIEW THEO SẢN PHẨM
   *  GET /api/reviews/product/:productId
   *  ================================ */
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;

      const reviews = await Review.find({ product: productId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đánh giá sản phẩm:", err);
      res.status(500).json({
        message: "Lỗi khi lấy đánh giá sản phẩm",
        error: err.message,
      });
    }
  }

  /** ================================
   *  LẤY COMMENT THEO BÀI VIẾT
   *  GET /api/reviews/post/:postId
   *  ================================ */
  async getByPost(req, res) {
    try {
      const { postId } = req.params;

      const comments = await Review.find({ post: postId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });

      res.json(comments);
    } catch (err) {
      console.error("❌ Lỗi khi lấy comment bài viết:", err);
      res.status(500).json({
        message: "Lỗi khi lấy comment",
        error: err.message,
      });
    }
  }

  /** ================================
   *  TẠO COMMENT CHO BÀI VIẾT
   *  POST /api/reviews/post/:postId
   *  ================================ */
  async createForPost(req, res) {
    try {
      const { postId } = req.params;
      const { comment, rating } = req.body;
      const userId = req.userId;

      const review = new Review({
        user: userId,
        post: postId,
        comment,
        rating: rating ?? null,
      });

      await review.save();

      const populated = await review.populate("user", "name avatar");
      res.status(201).json(populated);
    } catch (error) {
      console.error("❌ Lỗi khi tạo comment bài viết:", error);
      res.status(500).json({
        message: "Không thể tạo comment",
        error: error.message,
      });
    }
  }

  /** ================================
   *  TẠO REVIEW CHO SẢN PHẨM
   *  POST /api/reviews/product/:productId
   *  ================================ */
  async create(req, res) {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.userId;

      if (!rating) {
        return res.status(400).json({ message: "Rating là bắt buộc" });
      }

      const review = new Review({
        user: userId,
        product: productId,
        rating,
        comment,
      });

      await review.save();
      const populated = await review.populate("user", "name avatar");

      res.status(201).json(populated);
    } catch (error) {
      console.error("❌ Lỗi khi tạo review sản phẩm:", error);
      res.status(500).json({
        message: "Không thể tạo review",
        error: error.message,
      });
    }
  }

  /** ================================
   *  XOÁ REVIEW
   *  DELETE /api/reviews/:id
   *  ================================ */
  async remove(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const review = await Review.findById(id);
      if (!review)
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });

      if (review.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Không được xoá đánh giá của người khác" });
      }

      await Review.findByIdAndDelete(id);
      res.json({ message: "Đã xoá đánh giá thành công" });
    } catch (err) {
      console.error("❌ Lỗi khi xoá đánh giá:", err);
      res
        .status(500)
        .json({ message: "Lỗi khi xoá đánh giá", error: err.message });
    }
  }
}

module.exports = new ReviewController();
