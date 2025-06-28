// app/controllers/productController.js
const Product = require("../models/product");
const mongoose = require("mongoose");

class ProductController {
  // Lấy tất cả sản phẩm
  async getAll(req, res) {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Lấy chi tiết sản phẩm theo slug
  async getBySlug(req, res) {
    try {
      const product = await Product.findOne({ slug: req.params.slug });
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Lấy breadcrumb theo slug
  async getBreadcrumb(req, res) {
    try {
      const product = await Product.findOne({ slug: req.params.slug });

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      const breadcrumb = [
        { label: "Trang chủ", path: "/" },
        { label: "PC GVN", path: "/collections/pc-gvn" }, // Tạm hardcode
        { label: product.name, path: `/products/${product.slug}` },
      ];

      res.json(breadcrumb);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // API tạo sản phẩm từ React (POST /api/products)
  async createProduct(req, res) {
    try {
      const product = new Product(req.body); // Tự động tạo slug bằng middleware
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res
        .status(400)
        .json({ error: "Tạo sản phẩm thất bại", details: err.message });
    }
  }

  // Lấy sản phẩm liên quan
  async getRelatedProducts(req, res) {
    const { category, exclude } = req.query;

    try {
      const related = await Product.find({
        category, // cùng category
        _id: { $ne: exclude }, // loại trừ sản phẩm hiện tại
      }).limit(7); // lấy tối đa 4 sản phẩm

      res.json(related);
    } catch (err) {
      res.status(500).json({ error: "Không thể lấy sản phẩm liên quan" });
    }
  }

  // Thêm đánh giá cho sản phẩm
  async addReview(req, res) {
    const { rating, comment } = req.body;

    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const newReview = {
        name: req.user.name, // ✅ Lấy từ middleware
        rating: Number(rating),
        comment,
      };

      product.reviews.push(newReview);
      await product.save();

      res.status(201).json({ message: "Đã thêm đánh giá", review: newReview });
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi thêm đánh giá" });
    }
  }

  // Lấy danh sách đánh giá của sản phẩm
  async getReviews(req, res) {
    try {
      const product = await Product.findById(req.params.id).select("reviews");

      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      res.json(product.reviews);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách đánh giá" });
    }
  }

  // Trang edit sản phẩm
  async editProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      // Gửi JSON cho frontend React
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy thông tin sản phẩm" });
    }
  }

  // Cập nhật sản phẩm
  async getById(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm" });
    }
  }
}

module.exports = new ProductController();
