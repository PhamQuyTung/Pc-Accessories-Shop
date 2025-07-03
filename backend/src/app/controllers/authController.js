const bcrypt = require('bcrypt'); // sửa lại tên biến cho đúng
const jwt = require('jsonwebtoken');
const accountModel = require('../models/account');
const accountValid = require('../../validations/account');
const ErrorResponse = require('../../helpers/ErrorResponse');
const Token = require('../models/token');

const JWT_SECRET = '9b1c2f3e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7d8f9b0b1c'; // 🔐 Nên để trong biến môi trường .env

module.exports = {
    login: async (req, res) => {
        console.log(req.body);
        const { name, password } = req.body;

        // ✅ Kiểm tra xem tên đăng nhập và mật khẩu có được cung cấp không
        const account = await accountModel.findOne({ name: name });

        console.log('Tài khoản tìm được:', account);
        console.log('Mật khẩu nhập vào:', password);
        console.log('Mật khẩu trong DB:', account.password);

        // ✅ Sửa chỗ này:
        const checkPass = await bcrypt.compare(password, account.password);
        console.log('Kết quả check mật khẩu:', checkPass);


        // ✅ Kiểm tra xem tài khoản có tồn tại không
        if (!account) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng");
        }

        // Nếu mật khẩu không khớp, trả về lỗi
        if (!checkPass) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng");
        }

        // ✅ Tạo JWT token
        const token = jwt.sign(
            { id: account._id, name: account.name },   // payload
            JWT_SECRET,                                 // secret key
            { expiresIn: '1h' }                          // thời hạn token
        );

        // ✅ Lưu token vào cơ sở dữ liệu (nếu cần)
        await Token.create({
            userId: account._id,
            token: token,
        });

        // ✅ Trả về token + thông tin user
        return res.status(200).json({
            statusCode: 200,
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: account._id,
                name: account.name,
                email: account.email, // nếu có
                role: account.role // nếu có
            }
        });
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
            message: 'Đăng ký thành công',
        });
    },

    logout: async (req, res) => {
        // Xóa token hoặc làm gì đó để đăng xuất
        await Token.deleteOne({ token: req.body.refreshToken });
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Đăng xuất thành công',
        });
    },

    verifyToken: async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

        if (!token) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Không có token, yêu cầu xác thực',
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return res.status(200).json({
                statusCode: 200,
                message: 'Token hợp lệ',
                user: decoded,
            });
        } catch (error) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Token không hợp lệ hoặc đã hết hạn',
            });
        }
    }
};
