// app/controllers/accountController.js
const accountModel = require("../models/account");

module.exports = {
  // Các method login, register, logout giữ nguyên

  // ✅ Lấy toàn bộ danh sách account
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await accountModel.find();
      res.status(200).json(accounts);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách tài khoản" });
    }
  },
};
