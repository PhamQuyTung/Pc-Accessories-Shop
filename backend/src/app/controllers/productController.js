// app/controllers/productController.js
const Product = require("../models/product");
const Category = require("../models/category");
const Review = require("../models/review");
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

      if (category) {
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

        {
          $lookup: {
            from: "brands", // tên collection trong Mongo
            localField: "brand", // field trong Product
            foreignField: "_id", // so sánh với _id của Brand
            as: "brand",
          },
        },
        { $unwind: "$brand" }, // nếu 1 sản phẩm chỉ có 1 brand

        // ✅ THÊM ĐÂY:
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.rating" },
                0,
              ],
            },
            reviewCount: { $size: "$reviews" },
          },
        },

        // 👇 Phần sort & phân trang giữ nguyên
      ];

      // 👉 Nếu sort theo giá thì thêm field
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

      // 👉 Sort logic
      if (sort) {
        const [field, order] = sort.split("_");
        const sortValue = order === "asc" ? 1 : -1;
        const sortField = field === "price" ? "sortPrice" : field;
        pipeline.push({ $sort: { [sortField]: sortValue } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      // 👉 Đếm tổng
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: "total" });
      const countResult = await Product.aggregate(countPipeline);
      const totalCount = countResult[0]?.total || 0;

      // 👉 Phân trang
      pipeline.push({ $skip: skip }, { $limit: limitNum });

      const products = await Product.aggregate(pipeline);

      res.status(200).json({
        products,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
      });
    } catch (err) {
      console.log("Lỗi getAll:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  }

  // Lấy chi tiết sản phẩm theo slug
  async getBySlug(req, res) {
    try {
      const product = await Product.findOne({
        slug: req.params.slug,
        deleted: { $ne: true },
        visible: true,
      }).lean();

      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      // Lấy reviews từ collection Review
      const reviews = await Review.find({ product: product._id }).lean();
      const reviewCount = reviews.length;
      const averageRating = reviewCount
        ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviewCount
        : 0;

      res.json({
        ...product,
        averageRating: Number((Math.round(averageRating * 10) / 10).toFixed(1)),
        reviewCount,
        reviews, // Trả về danh sách đánh giá
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

  // Lấy theo danh mục (category)
  async getCategoryBreadcrumb(req, res) {
    try {
      const category = await Category.findOne({ slug: req.params.slug });
      if (!category) {
        return res.status(404).json({ error: "Không tìm thấy danh mục" });
      }

      const breadcrumb = [
        { label: "Trang chủ", path: "/" },
        {
          label: category.name,
          path: `/collections/${category.slug}`,
        },
      ];

      res.json(breadcrumb);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // API tạo sản phẩm từ React (POST /api/products)
  async createProduct(req, res) {
    try {
      const {
        name,
        images,
        price,
        discountPrice,
        quantity,
        status,
        visible,
        specs,
        category,
        brand,
        shortDescription,
        longDescription,
        dimensions,
        weight,
        variations,
      } = req.body;

      const product = new Product({
        name,
        images,
        price,
        discountPrice,
        quantity,
        status,
        visible,
        specs,
        category,
        brand,
        shortDescription,
        longDescription,
        dimensions: {
          length: dimensions?.length || 0,
          width: dimensions?.width || 0,
          height: dimensions?.height || 0,
          unit: dimensions?.unit || "cm",
        },
        weight: {
          value: weight?.value || 0,
          unit: weight?.unit || "kg",
        },
        variations: Array.isArray(variations)
          ? variations.map((v) => ({
              attributes: v.attributes || [],
              price: v.price,
              discountPrice: v.discountPrice,
              quantity: v.quantity,
              sku: v.sku,
              images: v.images || [],
            }))
          : [],
      });

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
      const related = await Product.aggregate([
        {
          $match: {
            category: new mongoose.Types.ObjectId(category),
            _id: { $ne: new mongoose.Types.ObjectId(exclude) },
            deleted: { $ne: true },
            visible: true,
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.rating" },
                0,
              ],
            },
            reviewCount: { $size: "$reviews" },
          },
        },
        { $limit: 7 },
      ]);

      res.json(related);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm liên quan:", err);
      res.status(500).json({ error: "Không thể lấy sản phẩm liên quan" });
    }
  }

  // Thêm đánh giá cho sản phẩm
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const productId = req.params.id;

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const newReview = new Review({
        product: productId,
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });

      await newReview.save();

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
      const data = { ...req.body };

      // đảm bảo luôn có shortDescription & longDescription
      data.shortDescription = data.shortDescription || "";
      data.longDescription = data.longDescription || "";

      if (data.dimensions) {
        data.dimensions = {
          length: data.dimensions.length || 0,
          width: data.dimensions.width || 0,
          height: data.dimensions.height || 0,
          unit: data.dimensions.unit || "cm",
        };
      }

      if (data.weight) {
        data.weight = {
          value: data.weight.value || 0,
          unit: data.weight.unit || "kg",
        };
      }

      if (Array.isArray(data.variations)) {
        data.variations = data.variations.map((v) => ({
          attributes: v.attributes || [],
          price: v.price,
          discountPrice: v.discountPrice,
          quantity: v.quantity,
          sku: v.sku,
          images: v.images || [],
        }));
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json(updated);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Lỗi khi cập nhật sản phẩm", details: err.message });
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
      const products = await Product.aggregate([
        {
          $match: {
            name: { $regex: query, $options: "i" },
            deleted: { $ne: true },
            visible: true,
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.rating" },
                0,
              ],
            },
            reviewCount: { $size: "$reviews" },
          },
        },
        { $limit: 10 },
      ]);

      res.json(products);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // PATCH /api/products/toggle-visible/:id
  async toggleVisible(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { visible: !product.visible },
        { new: true, runValidators: false } // Bỏ qua check brand
      );

      res.json({
        message: `Sản phẩm đã được ${updatedProduct.visible ? "hiển thị" : "ẩn"}`,
        visible: updatedProduct.visible,
      });
    } catch (err) {
      console.error("Lỗi toggleVisible:", err);
      res.status(500).json({ error: "Lỗi server", details: err.message });
    }
  }

  // Lấy sản phẩm theo danh mục slug
  async getByCategorySlug(req, res) {
    try {
      const category = await Category.findOne({ slug: req.params.slug });
      if (!category) {
        return res.status(404).json({ error: "Không tìm thấy danh mục" });
      }

      const products = await Product.aggregate([
        {
          $match: {
            category: category._id,
            deleted: { $ne: true },
            visible: true,
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: "$brand" },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "product",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.rating" },
                0,
              ],
            },
            reviewCount: { $size: "$reviews" },
          },
        },
      ]);

      res.json(products);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
}

module.exports = new ProductController();
