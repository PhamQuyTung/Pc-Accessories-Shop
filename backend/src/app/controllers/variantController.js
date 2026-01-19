const Product = require("../models/product");
const Attribute = require("../models/attribute");
const AttributeTerm = require("../models/attributeTerm");
const mongoose = require("mongoose");

// ============================ SUPPORT FUNCTIONS ============================

// Convert attributes → map for comparison
function normalizeAttrs(attrs = []) {
  const map = {};
  attrs.forEach((a) => {
    const attrId = String(a.attrId);
    const termId = Array.isArray(a.terms)
      ? String(a.terms[0])
      : String(a.terms);
    map[attrId] = termId;
  });
  return map;
}

// Compare normalized attributes
function isSameAttrs(aMap, bMap) {
  const aKeys = Object.keys(aMap);
  const bKeys = Object.keys(bMap);
  if (aKeys.length !== bKeys.length) return false;
  for (let k of aKeys) {
    if (!bMap.hasOwnProperty(k)) return false;
    if (String(aMap[k]) !== String(bMap[k])) return false;
  }
  return true;
}

// Safe ObjectId validator
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ============================ CONTROLLER ============================
module.exports = {
  // ================= GET VARIANTS OF ONE PRODUCT =================
  getVariantsByProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      if (!isValidObjectId(productId))
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });

      const product = await Product.findById(productId)
        .populate("variations.attributes.attrId")
        .populate("variations.attributes.terms");

      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      res.json({
        product: {
          id: product._id,
          name: product.name,
        },
        variants: product.variations || [],
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

      if (!isValidObjectId(productId))
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });

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

      console.log("🆕 CREATE VARIANT specOverrides:", data.specOverrides);

      if (!isValidObjectId(productId))
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      // SKU duplicate
      if (product.variations.find((v) => v.sku === data.sku)) {
        return res
          .status(400)
          .json({ message: "SKU đã tồn tại trong sản phẩm này." });
      }

      // Build attributes array
      const attrs = [];
      if (data.colorAttrId && data.colorTermId) {
        attrs.push({
          attrId: new mongoose.Types.ObjectId(data.colorAttrId),
          terms: [new mongoose.Types.ObjectId(data.colorTermId)],
        });
      }
      if (data.sizeAttrId && data.sizeTermId) {
        attrs.push({
          attrId: new mongoose.Types.ObjectId(data.sizeAttrId),
          terms: [new mongoose.Types.ObjectId(data.sizeTermId)],
        });
      }

      // Duplicate check
      const newMap = normalizeAttrs(attrs);
      const duplicate = product.variations.find((v) =>
        isSameAttrs(normalizeAttrs(v.attributes), newMap),
      );
      if (duplicate) {
        return res.status(400).json({
          message: "Biến thể với cặp thuộc tính này đã tồn tại.",
        });
      }

      // ================= SPEC OVERRIDES =================
      let specOverrides = {};

      if (data.specOverrides && typeof data.specOverrides === "object") {
        for (const [group, fields] of Object.entries(data.specOverrides)) {
          if (!group || typeof fields !== "object") continue;

          specOverrides[group] = {};
          for (const [label, value] of Object.entries(fields)) {
            if (!label) continue;
            specOverrides[group][label] = String(value ?? "");
          }
        }
      }

      const variant = {
        sku: data.sku,
        price: Number(data.price),
        discountPrice: data.discountPrice ?? null,
        quantity: Number(data.quantity) || 0,
        shortDescription: data.shortDescription || "",
        longDescription: data.longDescription || "",
        thumbnail: data.thumbnail || "",
        images: Array.isArray(data.images) ? data.images : [],
        attributes: attrs,
        specOverrides,
      };

      product.variations.push(variant);

      // 🟢 FIX: nếu chưa có defaultVariantId → set luôn
      if (!product.defaultVariantId) {
        const newlyCreatedVariant = product.variations.at(-1);
        product.defaultVariantId = newlyCreatedVariant._id;
      }

      await product.save();

      res.status(201).json({
        message: "Đã tạo biến thể",
        variant: product.variations.at(-1),
      });
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err });
    }
  },

  // ================= CREATE VARIANT DESCRIPTION ONLY =================
  createVariantDescription: async (req, res) => {
    try {
      const { variantId } = req.params;
      const { shortDescription = "", longDescription = "" } = req.body;

      if (!isValidObjectId(variantId))
        return res.status(400).json({ message: "ID biến thể không hợp lệ" });

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy biến thể." });

      const variant = product.variations.id(variantId);

      variant.shortDescription = shortDescription;
      variant.longDescription = longDescription;

      await product.save();

      res.status(201).json({
        message: "Đã tạo mô tả biến thể",
        variant: {
          _id: variant._id,
          shortDescription,
          longDescription,
        },
      });
    } catch (err) {
      console.error("Lỗi tạo mô tả biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  // ================= DELETE VARIANT =================
  deleteVariant: async (req, res) => {
    try {
      const { variantId } = req.params;

      if (!isValidObjectId(variantId))
        return res.status(400).json({ message: "ID biến thể không hợp lệ" });

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy biến thể." });

      const wasDefault = String(product.defaultVariantId) === String(variantId);

      product.variations = product.variations.filter(
        (v) => String(v._id) !== String(variantId),
      );

      // 🟢 nếu xoá default variant
      if (wasDefault) {
        product.defaultVariantId =
          product.variations.length > 0 ? product.variations[0]._id : null;
      }

      await product.save();

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

      console.log("🟡 UPDATE VARIANT REQ");
      console.log("variantId:", variantId);
      console.log("raw specOverrides from FE:", update.specOverrides);

      if (!isValidObjectId(variantId))
        return res.status(400).json({ message: "ID biến thể không hợp lệ" });

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy biến thể." });

      const variant = product.variations.id(variantId);

      // Fix attributes update with validation
      if (update.attributes && Array.isArray(update.attributes)) {
        try {
          update.attributes = update.attributes
            .filter((a) => a && a.attrId) // bỏ null/undefined
            .map((a) => {
              // ✅ Handle both object & string
              let attrIdStr = String(a.attrId);
              if (typeof a.attrId === "object" && a.attrId?._id) {
                attrIdStr = String(a.attrId._id);
              }

              if (!isValidObjectId(attrIdStr)) {
                throw new Error(`attrId không hợp lệ: ${attrIdStr}`);
              }

              // ✅ Handle terms: array of objects or strings
              let termsArray = Array.isArray(a.terms) ? a.terms : [a.terms];
              termsArray = termsArray
                .filter((t) => t) // bỏ null/undefined
                .map((t) => {
                  let tStr = String(t);
                  if (typeof t === "object" && t?._id) {
                    tStr = String(t._id);
                  }
                  if (!isValidObjectId(tStr)) {
                    throw new Error(`termId không hợp lệ: ${tStr}`);
                  }
                  return new mongoose.Types.ObjectId(tStr);
                });

              if (termsArray.length === 0) {
                throw new Error("terms array không được để trống");
              }

              return {
                attrId: new mongoose.Types.ObjectId(attrIdStr),
                terms: termsArray,
              };
            });

          // Duplicate check
          const newMap = normalizeAttrs(update.attributes);
          const duplicate = product.variations.find((v) => {
            if (String(v._id) === variantId) return false;
            return isSameAttrs(normalizeAttrs(v.attributes), newMap);
          });

          if (duplicate)
            return res.status(400).json({
              message: "Đã tồn tại biến thể với cặp thuộc tính này.",
            });
        } catch (attrErr) {
          return res.status(400).json({
            message: `Lỗi xử lý attributes: ${attrErr.message}`,
          });
        }
      }

      // ================= SPEC OVERRIDES =================
      if (update.specOverrides && typeof update.specOverrides === "object") {
        const normalized = {};

        for (const [key, value] of Object.entries(update.specOverrides)) {
          if (!key) continue;

          const strValue = String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();

          // ⛔ không lưu override rỗng
          if (strValue === "") continue;

          normalized[key] = strValue;
        }

        update.specOverrides = normalized;

        console.log("🟢 NORMALIZED specOverrides:", update.specOverrides);
      }

      console.log("🟠 BEFORE ASSIGN");
      console.log("variant.specOverrides (before):", variant.specOverrides);
      console.log("update.specOverrides:", update.specOverrides);

      Object.assign(variant, update);
      await product.save();

      const savedVariant = product.variations.id(variantId);

      console.log("✅ AFTER SAVE");
      console.log("savedVariant.specOverrides:", savedVariant.specOverrides);

      await product.populate("variations.attributes.attrId");
      await product.populate("variations.attributes.terms");

      res.json({
        message: "Đã cập nhật biến thể",
        variant: product.variations.id(variantId),
      });
    } catch (err) {
      console.error("Lỗi cập nhật biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  // ================= UPDATE VARIANT DESCRIPTION ONLY =================
  updateVariantDescription: async (req, res) => {
    try {
      const { variantId } = req.params;
      const { shortDescription, longDescription } = req.body;

      if (!isValidObjectId(variantId))
        return res.status(400).json({ message: "ID biến thể không hợp lệ" });

      const product = await Product.findOne({ "variations._id": variantId });
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy biến thể." });

      const variant = product.variations.id(variantId);

      if (shortDescription !== undefined)
        variant.shortDescription = shortDescription;

      if (longDescription !== undefined)
        variant.longDescription = longDescription;

      await product.save();

      res.json({
        message: "Đã cập nhật mô tả biến thể",
        variant: {
          _id: variant._id,
          shortDescription: variant.shortDescription,
          longDescription: variant.longDescription,
        },
      });
    } catch (err) {
      console.error("Lỗi cập nhật mô tả biến thể:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  // ================= CREATE BULK VARIANTS =================
  createBulkVariants: async (req, res) => {
    try {
      const { productId } = req.params;
      const variants = req.body.variants;

      if (!isValidObjectId(productId))
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });

      if (!Array.isArray(variants) || variants.length === 0)
        return res.status(400).json({ message: "Danh sách biến thể trống" });

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      const converted = [];

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];

        if (!v.sku || v.price == null)
          return res.status(400).json({
            message: `Biến thể index ${i} thiếu dữ liệu bắt buộc`,
          });

        if (product.variations.find((x) => x.sku === v.sku))
          return res.status(400).json({ message: `SKU ${v.sku} đã tồn tại.` });

        // ================= ATTRIBUTES =================
        const attrs = Array.isArray(v.attributes)
          ? v.attributes
              .filter((a) => a && typeof a === "object")
              .map((a) => ({
                attrId: a.attrId,
                terms: Array.isArray(a.terms) ? a.terms : [a.terms],
              }))
          : [];

        // ================= SPEC OVERRIDES (✅ ĐÚNG CHỖ) =================
        let specOverrides = {};

        if (v.specOverrides && typeof v.specOverrides === "object") {
          for (const [group, fields] of Object.entries(v.specOverrides)) {
            if (!group || typeof fields !== "object") continue;

            specOverrides[group] = {};
            for (const [label, value] of Object.entries(fields)) {
              if (!label) continue;
              specOverrides[group][label] = String(value ?? "");
            }
          }
        }

        converted.push({
          sku: v.sku,
          price: Number(v.price),
          discountPrice: v.discountPrice ?? null,
          quantity: Number(v.quantity) || 0,
          shortDescription: v.shortDescription || "",
          longDescription: v.longDescription || "",
          images: v.images || [],
          thumbnail: v.thumbnail || "",
          attributes: attrs,
          specOverrides, // ✅ mỗi variant 1 bộ override
        });
      }

      product.variations.push(...converted);

      // 🟢 FIX: nếu chưa có defaultVariantId
      if (!product.defaultVariantId && converted.length > 0) {
        const firstNewVariant =
          product.variations[product.variations.length - converted.length];
        product.defaultVariantId = firstNewVariant._id;
      }

      await product.save();

      res.status(201).json({
        message: "Đã tạo biến thể hàng loạt",
        variants: converted,
      });
    } catch (err) {
      console.error("Lỗi tạo biến thể hàng loạt:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  // ================= SET DEFAULT VARIANT =================
  setDefaultVariant: async (req, res) => {
    try {
      const { productId, variantId } = req.params;

      if (!isValidObjectId(productId) || !isValidObjectId(variantId))
        return res.status(400).json({ message: "ID không hợp lệ" });

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." });

      if (!product.variations.id(variantId))
        return res.status(400).json({
          message: "Biến thể không thuộc sản phẩm này.",
        });

      product.defaultVariantId = variantId;
      await product.save();

      res.json({
        success: true,
        message: "Đã đặt làm biến thể mặc định.",
        defaultVariantId: variantId,
      });
    } catch (err) {
      console.error("Lỗi set default variant:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },
};
