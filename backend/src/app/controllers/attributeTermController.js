const AttributeTerm = require("../models/attributeTerm");
const Attribute = require("../models/attribute");
const slugify = require("slugify");
const mongoose = require("mongoose");

const createAttributeTerm = async (req, res) => {
  console.log("📦 Request body:", req.body);

  try {
    const { attributeId } = req.params;
    const { name, color, image } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Giá trị chủng loại không hợp lệ hoặc không phải chuỗi.",
      });
    }

    const slug = slugify(name.trim(), { lower: true });

    const existing = await AttributeTerm.findOne({
      slug,
      attribute: attributeId,
    });

    if (existing) {
      return res.status(409).json({ message: "Chủng loại đã tồn tại." });
    }

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Không tìm thấy thuộc tính." });
    }

    const termData = {
      attribute: attributeId,
      name: name.trim(),
      slug,
    };

    console.log("🧩 Term data trước khi tạo:", termData);

    console.log("📛 attribute.type:", attribute.type);
    console.log("🎨 color input:", color);

    if (attribute.type === "color" && color) {
      termData.color = color;
    }

    if (attribute.type === "image" && image) {
      termData.image = image;
    }

    const newTerm = await AttributeTerm.create(termData);

    res.status(201).json(newTerm);
  } catch (error) {
    console.error("💥 Lỗi khi tạo AttributeTerm:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const getAttributeTerms = async (req, res) => {
  try {
    const { attributeId } = req.params;
    const terms = await AttributeTerm.find({ attribute: attributeId }).sort({
      createdAt: -1,
    });
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const deleteAttributeTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AttributeTerm.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy chủng loại." });
    }
    res.status(200).json({ message: "Đã xóa chủng loại." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const updateAttributeTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Tên không hợp lệ." });
    }

    const updated = await AttributeTerm.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug: slug?.trim()?.toLowerCase() || slugify(name, { lower: true }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy chủng loại." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Lỗi cập nhật attributeTerm:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = {
  createAttributeTerm,
  getAttributeTerms,
  deleteAttributeTerm,
  updateAttributeTerm,
};
