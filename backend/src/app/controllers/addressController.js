// controllers/addressController.js
const Address = require("../models/address");

const normalizePayload = (payload = {}) => {
  const out = { ...payload };
  [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "district",
    "ward",
    "detail",
    "postalCode",
  ].forEach((k) => {
    if (typeof out[k] === "string") out[k] = out[k].trim();
  });

  if (typeof out.email === "string") out.email = out.email.toLowerCase();
  if (!["home", "company", "other"].includes(out.type)) out.type = "home";
  return out;
};

exports.getAddresses = async (req, res) => {
  try {
    const list = await Address.find({ user_id: req.userId }).sort({
      isDefault: -1,
      updatedAt: -1,
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy địa chỉ" });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const payload = normalizePayload({ ...req.body, user_id: req.userId });

    if (payload.isDefault) {
      await Address.updateMany(
        { user_id: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await Address.create(payload);
    res.status(201).json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tạo địa chỉ" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizePayload(req.body);

    if (payload.isDefault) {
      await Address.updateMany(
        { user_id: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật địa chỉ" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.findOneAndDelete({
      _id: id,
      user_id: req.userId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    res.json({ message: "Đã xóa địa chỉ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá địa chỉ" });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault = true } = req.body ?? {};
    const userId = req.userId;

    // Bật mặc định
    if (isDefault) {
      await Address.updateMany(
        { user_id: userId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );

      const updated = await Address.findOneAndUpdate(
        { _id: id, user_id: userId },
        { $set: { isDefault: true } },
        { new: true }
      );

      if (!updated)
        return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return res.json(updated);
    }

    // Bỏ mặc định
    const updated = await Address.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: { isDefault: false } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái mặc định" });
  }
};
