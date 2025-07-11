const Menu = require('../models/menu');

// GET tất cả menu
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST thêm mới
exports.createMenu = async (req, res) => {
    try {
        const { name, slug, link, parent } = req.body;

        if (!name || !slug || !link) {
            return res.status(400).json({ message: 'Thiếu name, slug hoặc link' });
        }

        const newMenu = new Menu({ name, slug, link, parent: parent || null });
        await newMenu.save();
        res.status(201).json(newMenu);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo menu', error });
    }
};


// PUT cập nhật
exports.updateMenu = async (req, res) => {
    try {
        const { name, slug, link, parent } = req.body;

        if (!name || !slug || !link) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ Tên, Slug và Link!' });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            req.params.id,
            { name, slug, link, parent: parent || null },
            { new: true }
        );

        if (!updatedMenu) {
            return res.status(404).json({ message: 'Không tìm thấy menu để cập nhật!' });
        }

        res.json(updatedMenu);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật menu', error: err.message });
    }
};


// DELETE menu
exports.deleteMenu = async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi xóa menu', error: err });
    }
};
