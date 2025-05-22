const bcrypt = require('bcrypt'); // sửa lại tên biến cho đúng
const jwt = require('jsonwebtoken');
const accountModel = require('../models/account');
const accountValid = require('../../validations/account');
const ErrorResponse = require('../../helpers/ErrorResponse');

const JWT_SECRET = '9b1c2f3e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7d8f9b0b1c'; // 🔐 Nên để trong biến môi trường .env

module.exports = {
    login: async (req, res) => {
        const { name, password } = req.body;

        const account = await accountModel.findOne({ name: name });

        if (!account) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng");
        }

        const checkPass = bcrypt.compareSync(password, account.password);

        if (!checkPass) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng");
        }

        // ✅ Tạo JWT token
        const token = jwt.sign(
            { id: account._id, name: account.name },   // payload
            JWT_SECRET,                                 // secret key
            { expiresIn: '1h' }                          // thời hạn token
        );

        // ✅ Trả về token + thông tin user
        return res.status(200).json({
            statusCode: 200,
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: account._id,
                name: account.name,
                email: account.email // nếu có
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

        // ✅ Hash password trước khi lưu
        const salt = bcrypt.genSaltSync(10);
        value.password = bcrypt.hashSync(value.password, salt);

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
};
