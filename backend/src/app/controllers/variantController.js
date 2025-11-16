const Product = require("../models/product");
const Attribute = require("../models/attribute");
const AttributeTerm = require("../models/attributeTerm");
const mongoose = require("mongoose");

module.exports = {
  // ================= GET VARIANTS OF ONE PRODUCT =================
  getVariantsByProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId)
        .populate("variations.attributes.attrId")
        .populate("variations.attributes.terms");

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
      }

      res.json({
        product: {
          id: product._id,
          name: product.name,
        },
        variants: product.variations,
      });
    } catch (err) {
      console.error("Lỗi lấy biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= COUNT VARIANTS =================
  getVariantCount: async (req, res) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      res.json({ count: product.variations.length });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= CREATE VARIANT =================
  createVariant: async (req, res) => {
    try {
      const { productId } = req.params;
      const data = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
      }

      // Kiểm tra trùng SKU
      const existsSKU = product.variations.find((v) => v.sku === data.sku);
      if (existsSKU) {
        return res
          .status(400)
          .json({ message: "SKU đã tồn tại trong sản phẩm này." });
      }

      const variant = {
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        image: data.image || "",

        attributes: [],
      };

      // ========== MÀU ==========
      if (data.colorAttrId && data.colorTermId) {
        variant.attributes.push({
          attrId: data.colorAttrId,
          terms: [data.colorTermId],
        });
      }

      // ========== SIZE ==========
      if (data.sizeAttrId && data.sizeTermId) {
        variant.attributes.push({
          attrId: data.sizeAttrId,
          terms: [data.sizeTermId],
        });
      }

      product.variations.push(variant);

      await product.save();

      res.status(201).json({
        message: "Đã tạo biến thể",
        variant: product.variations.slice(-1)[0],
      });
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= DELETE VARIANT =================
  deleteVariant: async (req, res) => {
    try {
      const { variantId } = req.params;

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy biến thể." });
      }

      product.variations = product.variations.filter(
        (v) => v._id.toString() !== variantId
      );
      await product.save();

      res.json({ message: "Đã xoá biến thể." });
    } catch (err) {
      console.error("Lỗi xoá biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= UPDATE VARIANT =================
  updateVariant: async (req, res) => {
    try {
      const { variantId } = req.params;
      const update = req.body;

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy biến thể." });
      }

      const variant = product.variations.id(variantId);

      if (!variant) {
        return res.status(404).json({ message: "Biến thể không tồn tại." });
      }

      if (update.attributes) {
        update.attributes = update.attributes.map((a) => ({
          attrId: a.attrId,
          terms: Array.isArray(a.terms) ? a.terms : [a.terms],
        }));
      }

      Object.assign(variant, update);
      await product.save();

      // Populate lại trước khi trả về
      await product.populate("variations.attributes.attrId");
      await product.populate("variations.attributes.terms");

      const updatedVariant = product.variations.id(variantId);

      res.json({
        message: "Đã cập nhật biến thể",
        variant: updatedVariant,
      });
    } catch (err) {
      console.error("Lỗi cập nhật biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= CREATE BULK VARIANTS =================
  createBulkVariants: async (req, res) => {
    try {
      const { productId } = req.params;
      const variants = req.body.variants;

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      // Kiểm tra trùng SKU
      for (let v of variants) {
        const exists = product.variations.find((item) => item.sku === v.sku);
        if (exists) {
          return res.status(400).json({
            message: `SKU ${v.sku} đã tồn tại trong sản phẩm này.`,
          });
        }
      }

      // Convert
      const convertedVariants = variants.map((v) => ({
        sku: v.sku,
        price: v.price,
        discountPrice: v.discountPrice || null,
        quantity: v.quantity,
        images: v.images || [],
        attributes: v.attributes.map((a) => ({
          attrId: a.attrId,
          terms: [a.termId],
        })),
        dimensions: v.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          unit: "cm",
        },
        weight: v.weight || { value: 0, unit: "kg" },
      }));

      // Push vào DB
      product.variations.push(...convertedVariants);
      await product.save();

      res.status(201).json({
        message: "Đã tạo biến thể hàng loạt",
        variants: convertedVariants,
      });
    } catch (err) {
      console.error("Lỗi tạo biến thể hàng loạt:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },
};
