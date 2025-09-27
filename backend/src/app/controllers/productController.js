// app/controllers/productController.js
const Product = require("../models/product");
const Category = require("../models/category");
const Review = require("../models/review");
const mongoose = require("mongoose");
const { computeProductStatus } = require("../../../../shared/productStatus");

class ProductController {
  // Lấy tất cả sản phẩm
  async getAll(req, res) {
    try {
      const {
        isAdmin,
        search,
        category,
        categoryId,
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

      if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        match.category = new mongoose.Types.ObjectId(categoryId);
      } else if (category) {
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

      // 👉 Tính tổng số sản phẩm trước (không bị ảnh hưởng bởi skip/limit)
      const totalCount = await Product.countDocuments(match);

      // 👉 Pipeline chính
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
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
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
            finalPrice: {
              $cond: {
                if: { $gt: ["$discountPrice", 0] },
                then: "$discountPrice",
                else: "$price",
              },
            },
          },
        },
      ];

      // 👉 Nếu sort theo giá thì thêm field sortPrice
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

      // 👉 Sort
      if (sort) {
        const [field, order] = sort.split("_");
        const sortValue = order === "asc" ? 1 : -1;
        const sortField = field === "price" ? "sortPrice" : field;
        pipeline.push({ $sort: { [sortField]: sortValue } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      // 👉 Phân trang
      pipeline.push({ $skip: skip }, { $limit: limitNum });

      const products = await Product.aggregate(pipeline);

      // ✅ Cập nhật status động theo quantity
      const productsWithStatus = products.map((p) => ({
        ...p,
        status: computeProductStatus(p, { importing: p.importing }),
      }));

      res.status(200).json({
        products: productsWithStatus,
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
        status: computeProductStatus(product, { importing: product.importing }), // ✅ cập nhật status
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
        visible,
        specs,
        category,
        brand,
        shortDescription,
        longDescription,
        dimensions,
        weight,
        variations,
        importing, // 👈 nếu bạn có field này
      } = req.body;

      const product = new Product({
        name,
        images,
        price,
        discountPrice,
        quantity,
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

      // ✅ Tính status dựa trên quantity + variations thay vì lấy từ client
      product.status = computeProductStatus(product, { importing });

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

      // ✅ Gắn status động
      const relatedWithStatus = related.map((p) => ({
        ...p,
        status: computeProductStatus(p, { importing: p.importing }),
      }));

      res.json(relatedWithStatus);
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
      const productId = req.params.id;

      // Kiểm tra sản phẩm có tồn tại không
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      // Lấy tất cả review theo productId
      const reviews = await Review.find({ product: productId })
        .populate("user", "name") // 👉 nếu muốn lấy thêm tên user
        .sort({ createdAt: -1 }); // 👉 sort mới nhất trước

      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách đánh giá" });
    }
  }

  // Trang edit sản phẩm
  async editProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate("category", "name slug") // 👉 lấy thêm thông tin category
        .populate("brand", "name slug") // 👉 lấy thêm thông tin brand
        .lean();

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json({
        ...product,
        status: computeProductStatus(product, { importing: product.importing }), // ✅ đồng bộ status
      });
    } catch (err) {
      console.error("❌ Lỗi editProduct:", err);
      res.status(500).json({ error: "Lỗi khi lấy thông tin sản phẩm" });
    }
  }

  // Lấy sản phẩm theo ID
  async getById(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }
    try {
      const product = await Product.findById(req.params.id)
        .populate("category", "name slug")
        .populate("brand", "name slug")
        .lean();

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json({
        ...product,
        status: computeProductStatus(product, { importing: product.importing }), // ✅ đồng bộ status
      });
    } catch (err) {
      console.error("❌ Lỗi getById:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const data = { ...req.body };

      // ✅ Bỏ status client gửi, ta sẽ tính lại
      delete data.status;

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

      // 🟢 Tính lại status dựa trên dữ liệu mới
      data.status = computeProductStatus(data, { importing: data.importing });

      // 🟢 Cập nhật và trả về document mới
      const updated = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json(updated);
    } catch (err) {
      console.error("❌ Lỗi updateProduct:", err);
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
        { deleted: true, deletedAt: new Date() }, // 👈 thêm timestamp
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json({ message: "Đã chuyển sản phẩm vào thùng rác", product });
    } catch (err) {
      console.error("❌ Lỗi softDeleteProduct:", err);
      res.status(500).json({ error: "Lỗi khi xóa tạm thời" });
    }
  }

  // Lấy sản phẩm trong thùng rác
  async getTrash(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        Product.find({ deleted: true })
          .populate("category", "name slug")
          .populate("brand", "name slug")
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments({ deleted: true }),
      ]);

      // ✅ cập nhật status động
      const productsWithStatus = products.map((p) => ({
        ...p,
        status: computeProductStatus(p, { importing: p.importing }),
      }));

      res.json({
        products: productsWithStatus,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
      });
    } catch (err) {
      console.error("❌ Lỗi getTrash:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // Xóa sản phẩm vĩnh viễn
  async forceDeleteProduct(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      // ❗ Tuỳ chọn: xóa luôn reviews liên quan
      await Review.deleteMany({ product: product._id });

      res.json({ message: "Đã xóa sản phẩm vĩnh viễn cùng với reviews" });
    } catch (err) {
      console.error("❌ Lỗi forceDeleteProduct:", err);
      res.status(500).json({ error: "Lỗi khi xóa vĩnh viễn" });
    }
  }

  // Khôi phục sản phẩm từ thùng rác
  async restoreProduct(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID không hợp lệ" });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { deleted: false, deletedAt: null }, // 👈 clear timestamp
        { new: true }
      ).lean();

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      // ✅ cập nhật status động
      const restored = {
        ...product,
        status: computeProductStatus(product, { importing: product.importing }),
      };

      res.json({ message: "Đã khôi phục sản phẩm", product: restored });
    } catch (err) {
      console.error("❌ Lỗi restoreProduct:", err);
      res.status(500).json({ error: "Lỗi khi khôi phục sản phẩm" });
    }
  }

  // Tìm kiếm sản phẩm
  async searchProducts(req, res) {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query không được để trống" });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const products = await Product.aggregate([
        {
          $match: {
            name: { $regex: query.trim(), $options: "i" },
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
            finalPrice: {
              $cond: {
                if: { $gt: ["$discountPrice", 0] },
                then: "$discountPrice",
                else: "$price",
              },
            },
          },
        },
        { $skip: skip },
        { $limit: limitNum },
      ]);

      // ✅ cập nhật status động
      const productsWithStatus = products.map((p) => ({
        ...p,
        status: computeProductStatus(p, { importing: p.importing }),
      }));

      res.json(productsWithStatus);
    } catch (err) {
      console.error("❌ Lỗi khi tìm kiếm sản phẩm:", err);
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

      product.visible = !product.visible;
      await product.save();

      // ✅ status động
      const updated = {
        ...product.toObject(),
        status: computeProductStatus(product, { importing: product.importing }),
      };

      res.json({
        message: `Sản phẩm đã được ${updated.visible ? "hiển thị" : "ẩn"}`,
        product: updated,
      });
    } catch (err) {
      console.error("❌ Lỗi toggleVisible:", err);
      res.status(500).json({ error: "Lỗi server", details: err.message });
    }
  }

  // GET /api/products/category/:slug?page=1&limit=20
  async getByCategorySlug(req, res) {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const category = await Category.findOne({ slug });
      if (!category) {
        return res.status(404).json({ error: "Không tìm thấy danh mục" });
      }

      const skip = (Number(page) - 1) * Number(limit);

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
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
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
        { $sort: { createdAt: -1 } }, // mới nhất trước
        { $skip: skip },
        { $limit: Number(limit) },
      ]);

      // ✅ Gắn status
      const productsWithStatus = products.map((p) => ({
        ...p,
        status: computeProductStatus(p, { importing: p.importing }),
      }));

      res.json({
        page: Number(page),
        limit: Number(limit),
        total: productsWithStatus.length,
        products: productsWithStatus,
      });
    } catch (err) {
      console.error("❌ Lỗi khi lấy sản phẩm theo danh mục:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  // GET /api/products/count
  async countProducts(req, res) {
    try {
      const stats = await Product.aggregate([
        { $match: { deleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            visible: { $sum: { $cond: ["$visible", 1, 0] } },
            hidden: { $sum: { $cond: ["$visible", 0, 1] } },
            importing: { $sum: { $cond: ["$importing", 1, 0] } },
          },
        },
      ]);

      res.json(stats[0] || { total: 0, visible: 0, hidden: 0, importing: 0 });
    } catch (err) {
      console.error("❌ Lỗi khi đếm sản phẩm:", err);
      res.status(500).json({ error: "Lỗi khi đếm sản phẩm" });
    }
  }

  // GET /api/products/stats
  async getProductStats(req, res) {
    try {
      const stats = await Product.aggregate([
        { $match: { deleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            visible: { $sum: { $cond: ["$visible", 1, 0] } },
            hidden: { $sum: { $cond: ["$visible", 0, 1] } },
          },
        },
      ]);

      res.json(stats[0] || { total: 0, visible: 0, hidden: 0 });
    } catch (err) {
      console.error("❌ Lỗi khi thống kê sản phẩm:", err);
      res.status(500).json({ error: "Lỗi khi thống kê sản phẩm" });
    }
  }

  // Giảm tồn kho khi order
  async decreaseStock(req, res) {
    try {
      const { variationId, quantity } = req.body;
      const { id: productId } = req.params;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Số lượng không hợp lệ" });
      }

      let product;

      if (variationId) {
        // Giảm tồn kho variation
        product = await Product.findOneAndUpdate(
          {
            _id: productId,
            "variations._id": variationId,
            "variations.quantity": { $gte: quantity },
          },
          {
            $inc: { "variations.$.quantity": -quantity },
          },
          { new: true }
        );
      } else {
        // Giảm tồn kho tổng
        product = await Product.findOneAndUpdate(
          {
            _id: productId,
            quantity: { $gte: quantity },
          },
          { $inc: { quantity: -quantity } },
          { new: true }
        );
      }

      if (!product) {
        return res.status(400).json({
          error: "Sản phẩm đã hết hàng hoặc không đủ số lượng",
        });
      }

      // ✅ Luôn tính lại status
      product.status = computeProductStatus(product, {
        importing: product.importing,
      });

      // 🟢 Lưu lại để status đồng bộ DB
      await product.save();

      res.json({
        message: "Đã cập nhật tồn kho",
        product,
      });
    } catch (err) {
      console.error("❌ Lỗi decreaseStock:", err);
      res.status(500).json({ error: "Lỗi server", details: err.message });
    }
  }

  // PATCH /api/products/:id/increase-stock
  async increaseStock(req, res) {
    try {
      const { variationId, quantity } = req.body;
      const { id: productId } = req.params;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Số lượng không hợp lệ" });
      }

      let product;

      if (variationId) {
        // Hoàn kho cho variation
        product = await Product.findOneAndUpdate(
          { _id: productId, "variations._id": variationId },
          { $inc: { "variations.$.quantity": quantity } },
          { new: true }
        );
      } else {
        // Hoàn kho cho tổng sản phẩm
        product = await Product.findByIdAndUpdate(
          productId,
          { $inc: { quantity } },
          { new: true }
        );
      }

      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      // ✅ Luôn tính lại status sau khi cập nhật
      product.status = computeProductStatus(product, {
        importing: product.importing,
      });

      await product.save();

      res.json({
        message: "Đã hoàn kho sản phẩm",
        product,
      });
    } catch (err) {
      console.error("❌ Lỗi increaseStock:", err);
      res.status(500).json({ error: "Lỗi server", details: err.message });
    }
  }
}

module.exports = new ProductController();
