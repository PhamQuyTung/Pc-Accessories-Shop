const bcrypt = require("bcrypt"); // sửa lại tên biến cho đúng
const jwt = require("jsonwebtoken");
const accountModel = require("../models/account");
const accountValid = require("../../validations/account");
const ErrorResponse = require("../../helpers/ErrorResponse");
const Token = require("../models/token");

const JWT_SECRET =
  "9b1c2f3e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7d8f9b0b1c"; // 🔐 Nên để trong biến môi trường .env

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // 1. Validate input
      if (!email || !password) {
        return res.status(400).json({
          statusCode: 400,
          message: "Vui lòng nhập email và mật khẩu",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // 2. Tìm user theo email
      const account = await accountModel.findOne({ email: normalizedEmail });
      if (!account) {
        return res.status(400).json({
          statusCode: 400,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // 3. So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        return res.status(400).json({
          statusCode: 400,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // 4. Tạo token
      const token = jwt.sign(
        { id: account._id, role: account.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 5. Trả về
      return res.status(200).json({
        statusCode: 200,
        message: "Đăng nhập thành công",
        token,
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          role: account.role,
          avatar: account.avatar,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        statusCode: 500,
        message: "Lỗi máy chủ. Vui lòng thử lại sau.",
      });
    }
  },

  register: async (req, res) => {
    const body = req.body;
    const { error, value } = accountValid(body);

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.message,
      });
    }

    // Bỏ đi vì đã hash mật khẩu trong mô hình account
    // // ✅ Hash password trước khi lưu
    // const salt = await bcrypt.genSalt(10);
    // value.password = await bcrypt.hash(value.password, salt);

    const account = await accountModel.create(value);

    return res.status(201).json({
      account: account,
      message: "Đăng ký thành công",
    });
  },

  logout: async (req, res) => {
    // Xóa token hoặc làm gì đó để đăng xuất
    await Token.deleteOne({ token: req.body.refreshToken });

    return res.status(200).json({
      statusCode: 200,
      message: "Đăng xuất thành công",
    });
  },

  verifyToken: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "Không có token, yêu cầu xác thực",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({
        statusCode: 200,
        message: "Token hợp lệ",
        user: decoded,
      });
    } catch (error) {
      return res.status(401).json({
        statusCode: 401,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }
  },
};
