// app/controllers/productController.js
const Product = require("../models/product");

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

  // Tạm thời mock create
  create(req, res) {
    res.send("Trang tạo sản phẩm");
  }
}

module.exports = new ProductController();
