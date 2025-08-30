const Brand = require("../models/brand");
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
};

module.exports = brandController;
