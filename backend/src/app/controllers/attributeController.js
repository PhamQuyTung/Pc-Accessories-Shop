// backend/src/app/controllers/attributeController.js
const Attribute = require('../models/attribute');

exports.getAll = async (req, res) => {
    try {
        const list = await Attribute.find().sort({ createdAt: -1 });
        res.json(list);
    } catch {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getAttributeById = async (req, res) => {
    try {
        const attribute = await Attribute.findById(req.params.id);
        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.json(attribute);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const item = await Attribute.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: 'Tạo thất bại', error: err });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: 'Cập nhật thất bại' });
    }
};

exports.remove = async (req, res) => {
    try {
        await Attribute.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        res.status(400).json({ message: 'Xóa thất bại' });
    }
};
