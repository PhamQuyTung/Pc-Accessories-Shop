// src/app/middlewares/validateMiddleware.js
const validateRegister = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = {};

    if (!name || name.trim() === '') {
        errors.name = 'Tên đăng nhập không được để trống.';
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email không hợp lệ.';
    }

    if (!password || password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email không hợp lệ.';
    }

    if (!password) {
        errors.password = 'Mật khẩu không được để trống.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = { validateRegister, validateLogin };
