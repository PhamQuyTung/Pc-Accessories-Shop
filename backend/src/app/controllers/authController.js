const bcript = require('bcrypt');
const accountModel = require('../models/account');
const accountValid = require('../../validations/account');
const ErrorResponse = require('../../helpers/ErrorResponse');

module.exports = {
    login: async(req, res) => {
        // login
        const { name, password } = req.body;

        // Kiểm tra so sánh tên đăng nhập chính xác chưa
        const account = await accountModel.findOne({ 
            name: name 
        });

        // Nếu không tìm thấy tài khoản
        if (!account) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng")
        }

        // Kiểm tra mật khẩu
        const checkPass = bcript.compareSync(password, account.password);   // So sánh mật khẩu password với password trong db

        // Nếu mật khẩu không đúng
        if (!checkPass) {
            throw new ErrorResponse(400, "Tài khoản hoặc mật khẩu không đúng")
        }

        // Nếu tài khoản và mật khẩu đúng
        return res.status(200).json({
            statusCode: 200,
            message: 'Đăng nhập thành công',
        });
    },

    register: async(req, res) => {
        // register
        const body = req.body;
        const { error, value } = accountValid(body);
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                message: error.message,
            });
        }

        // Lưu vào value
        const account = await accountModel.create(value);

        // Nếu đăng kí thành công 
        return res.status(201).json({
            account: account,
            message: 'Đăng ký thành công',
        });
    },
}