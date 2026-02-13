const path = require("path");
const fs = require("fs");
const accountModel = require("../models/account");

const publicUrl = (req, filePath) => {
  // chuẩn hoá url public cho FE (http(s)://domain/uploads/avatars/xxx.png)
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}${filePath.replace(/\\/g, "/")}`;
};

module.exports = {
  // ========== GET ALL ==========
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await accountModel.find().select("-password");
      res.status(200).json(accounts);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách tài khoản" });
    }
  },

  // ========== GET ME ==========
  getMe: async (req, res) => {
    try {
      const user = await accountModel.findById(req.user.id).select("-password");
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      res.json(user);
    } catch (err) {
      console.error("getMe error", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // ========== UPDATE PROFILE (KHÔNG XỬ LÝ FILE Ở ĐÂY) ==========
  updateAccount: async (req, res) => {
    try {
      const fields = [
        "name",
        "firstName",
        "lastName",
        "dob",
        "gender",
        "phone",
        "email",
      ];
      const data = {};
      fields.forEach((f) => {
        if (req.body[f] !== undefined) data[f] = req.body[f];
      });

      // sync name nếu bạn vẫn dùng
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const user = await accountModel
          .findById(req.user.id)
          .select("firstName lastName");
        const firstName = data.firstName ?? user.firstName ?? "";
        const lastName = data.lastName ?? user.lastName ?? "";
        data.name = `${firstName} ${lastName}`.trim();
      }

      const updated = await accountModel
        .findByIdAndUpdate(
          req.user.id,
          { $set: data },
          { new: true, runValidators: true },
        )
        .select("-password");

      res.json(updated);
    } catch (err) {
      console.error("updateAccount error", err);
      res.status(500).json({ message: "Lỗi khi cập nhật tài khoản" });
    }
  },

  // ========== UPLOAD AVATAR ==========
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được upload" });
      }

      // Nếu muốn xoá avatar cũ (nếu lưu path local)
      const user = await accountModel.findById(req.user.id).select("avatar");
      const oldAvatar = user?.avatar;

      const fileUrl = publicUrl(req, `/uploads/avatars/${req.file.filename}`);

      const updated = await accountModel
        .findByIdAndUpdate(
          req.user.id,
          { $set: { avatar: fileUrl } },
          { new: true },
        )
        .select("-password");

      // XÓA FILE CŨ (nếu file cũ cũng là local path của system này)
      // chỉ xoá nếu oldAvatar bắt đầu bằng host hiện tại và path trỏ tới uploads/avatars
      if (oldAvatar && oldAvatar.includes("/uploads/avatars/")) {
        try {
          const oldFilePath = path.join(
            process.cwd(),
            oldAvatar.replace(`${req.protocol}://${req.get("host")}`, ""),
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, () => {});
          }
        } catch (_) {}
      }

      res.json(updated);
    } catch (err) {
      console.error("uploadAvatar error", err);
      res.status(500).json({ message: "Upload avatar thất bại" });
    }
  },

  // ========== ADD RECENTLY VIEWED ==========
  addRecentlyViewed: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ message: "Thiếu productId" });
      }

      const user = await accountModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy user" });
      }

      // XÓA nếu đã tồn tại (tránh trùng)
      user.recentlyViewed = user.recentlyViewed.filter(
        (id) => id.toString() !== productId,
      );

      // Thêm vào đầu danh sách
      user.recentlyViewed.unshift(productId);

      // Giới hạn 12 sản phẩm gần nhất
      user.recentlyViewed = user.recentlyViewed.slice(0, 12);

      await user.save();

      res.json({ message: "Đã thêm sản phẩm đã xem" });
    } catch (err) {
      console.error("addRecentlyViewed error", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // ========== GET RECENTLY VIEWED ==========
  getRecentlyViewed: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await accountModel
        .findById(userId)
        .populate({
          path: "recentlyViewed",
          match: { visible: true },
          populate: {
            path: "variations.attributes.terms",
          },
        })
        .select("recentlyViewed");

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy user" });
      }

      res.json(user.recentlyViewed || []);
    } catch (err) {
      console.error("getRecentlyViewed error", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },
};
