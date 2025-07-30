// app/controllers/productController.js
const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");

class ProductController {
  // Lấy tất cả sản phẩm
  async getAll(req, res) {
    try {
      const {
        isAdmin,
        search,
        category,
        visible,
        sort,
        page = 1,
        limit = 10,
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let match = { deleted: { $ne: true } };

      if (search) {
        match.name = { $regex: search, $options: "i" };
      }

      // Nếu có category, tìm _id của category đó
      // Giả sử category là slug, nếu là _id thì không cần tìm
      if (category) {
        // Nếu category là slug, có thể cần join hoặc truy vấn riêng để tìm _id
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          match.category = cat._id;
        }
      }

      if (visible !== undefined && visible !== "") {
        match.visible = visible === "true";
      }

      if (isAdmin !== "true") {
        match.visible = true;
      }

      // Bắt đầu pipeline
      let pipeline = [
        { $match: match },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
      ];

      // Nếu sort theo giá thì thêm field sortPrice
      if (sort && sort.startsWith("price")) {
        pipeline.push({
          $addFields: {
            sortPrice: {
              $cond: {
                if: { $gt: [{ $toDouble: "$discountPrice" }, 0] },
                then: { $toDouble: "$discountPrice" },
                else: { $toDouble: "$price" },
              },
            },
          },
        });
      }

      // Sort
      if (sort) {
        const [field, order] = sort.split("_");
        const sortValue = order === "asc" ? 1 : -1;

        const sortField = field === "price" ? "sortPrice" : field;
        pipeline.push({ $sort: { [sortField]: sortValue } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } }); // Default sort
      }

      // Đếm tổng số
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: "total" });
      const countResult = await Product.aggregate(countPipeline);
      const totalCount = countResult[0]?.total || 0;

      // Phân trang
      pipeline.push({ $skip: skip }, { $limit: limitNum });

      const products = await Product.aggregate(pipeline);

      res.status(200).json({
        products,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
      });
    } catch (err) {
      console.log("Lỗi getAll:", err); // <--- nên log ra
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  }

  // Lấy chi tiết sản phẩm theo slug
  async getBySlug(req, res) {
    try {
      const product = await Product.findOne({
        slug: req.params.slug,
        deleted: { $ne: true }, // Chỉ lấy sản phẩm chưa xóa
        visible: true, // Chỉ lấy sản phẩm đang hiển thị
      }).lean();

      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const reviews = product.reviews || [];
      const reviewCount = reviews.length;
      const averageRating = reviewCount
        ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviewCount
        : 0;

      res.json({
        ...product,
        averageRating: Number((Math.round(averageRating * 10) / 10).toFixed(1)),
        reviewCount,
      });
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Lấy breadcrumb theo slug
  async getBreadcrumb(req, res) {
    try {
      const product = await Product.findOne({ slug: req.params.slug }).populate(
        "category"
      );

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      const breadcrumb = [
        { label: "Trang chủ", path: "/" },
        {
          label: product.category?.name || "Danh mục",
          path: `/collections/${product.category?.slug || ""}`,
        },
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
        category,
        _id: { $ne: exclude },
        deleted: { $ne: true }, // Chỉ lấy sản phẩm chưa xóa
        visible: true, // Chỉ lấy sản phẩm đang hiển thị
      })
        .limit(7)
        .lean(); // Thêm .lean() để hiệu suất tốt hơn

      const enrichedRelated = related.map((product) => {
        const reviews = product.reviews || [];
        const reviewCount = reviews.length;
        const averageRating = reviewCount
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

        return {
          ...product,
          averageRating: Number(
            (Math.round(averageRating * 10) / 10).toFixed(1)
          ),
          reviewCount,
        };
      });

      res.json(enrichedRelated);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm liên quan:", err);
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
      console.log("Body:", req.body);
      console.log("👤 User review:", req.user);

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

  // Xóa sản phẩm (chuyển vào thùng rác)
  async softDeleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { deleted: true },
        { new: true }
      );
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json({ message: "Đã chuyển vào thùng rác", product });
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi xóa tạm thời" });
    }
  }

  // Lấy sản phẩm trong thùng rác
  async getTrash(req, res) {
    try {
      const products = await Product.find({ deleted: true });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Xóa sản phẩm vĩnh viễn
  async forceDeleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json({ message: "Đã xóa vĩnh viễn" });
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi xóa vĩnh viễn" });
    }
  }

  // Khôi phục sản phẩm từ thùng rác
  async restoreProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { deleted: false },
        { new: true }
      );
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      res.json({ message: "Đã khôi phục sản phẩm", product });
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi khôi phục sản phẩm" });
    }
  }

  // Tìm kiếm sản phẩm
  async searchProducts(req, res) {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query không được để trống" });
    }

    try {
      const products = await Product.find({
        name: { $regex: query, $options: "i" },
        deleted: { $ne: true },
        visible: true, // Chỉ lấy sản phẩm đang hiển thị
      })
        .limit(10)
        .lean();

      const enrichedProducts = products.map((product) => {
        const reviews = product.reviews || [];
        const reviewCount = reviews.length;
        const averageRating = reviewCount
          ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviewCount
          : 0;

        return {
          ...product,
          averageRating: Number(
            (Math.round(averageRating * 10) / 10).toFixed(1)
          ),
          reviewCount,
        };
      });

      res.json(enrichedProducts);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // PATCH /api/products/toggle-visible/:id
  async toggleVisible(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      product.visible = !product.visible;
      await product.save();

      res.json({
        message: `Sản phẩm đã được ${product.visible ? "hiển thị" : "ẩn"}`,
        visible: product.visible,
      });
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }
}

module.exports = new ProductController();
