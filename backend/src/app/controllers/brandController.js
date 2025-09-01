const Brand = require("../models/brand");
const Product = require("../models/product");
const slugify = require("slugify");

const brandController = {
  // GET all brands
  async getAll(req, res) {
    try {
      const brands = await Brand.find();
      res.json(brands);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // CREATE new brand
  async create(req, res) {
    try {
      const { name, description, logo } = req.body;
      const slug = slugify(name, { lower: true, strict: true });

      const brand = new Brand({
        name,
        slug,
        description,
        logo,
      });

      await brand.save();
      res.status(201).json(brand);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // UPDATE brand
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, logo, isVisible } = req.body;

      const brand = await Brand.findByIdAndUpdate(
        id,
        {
          name,
          slug: slugify(name, { lower: true, strict: true }),
          description,
          logo,
          isVisible,
        },
        { new: true }
      );

      if (!brand) return res.status(404).json({ message: "Brand not found" });
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // DELETE brand
  async remove(req, res) {
    try {
      const { id } = req.params;
      const brand = await Brand.findByIdAndDelete(id);
      if (!brand) return res.status(404).json({ message: "Brand not found" });
      res.json({ message: "Brand deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // GET brands with pagination
  async getPaginated(req, res) {
    try {
      let { page = 1, limit = 10, search = "", sortField = "createdAt", sortOrder = "desc" } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      const sort = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      const query = search ? { name: { $regex: search, $options: "i" } } : {};

      const total = await Brand.countDocuments(query);

      // Lấy danh sách brand kèm số sản phẩm
      const brands = await Brand.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "products", // tên collection trong MongoDB
            localField: "_id", // Brand._id
            foreignField: "brand", // Product.brand
            as: "products",
          },
        },
        {
          $addFields: {
            productCount: { $size: "$products" },
          },
        },
        {
          $project: {
            products: 0, // ẩn mảng products, chỉ giữ lại số lượng
          },
        },
      ]);

      res.json({
        success: true,
        data: brands,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = brandController;
