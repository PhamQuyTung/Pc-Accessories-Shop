const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// // Đăng ký
// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Kiểm tra xem email đã tồn tại chưa
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email đã được sử dụng.' });
//         }

//         // Mã hóa mật khẩu
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Tạo người dùng mới
//         const newUser = new User({ name, email, password: hashedPassword });
//         await newUser.save();

//         res.status(201).json({ message: 'Đăng ký thành công!' });
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi server.' });
//     }
// };

// // Đăng nhập
// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Tìm người dùng theo email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
//         }

//         // Kiểm tra mật khẩu
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
//         }

//         // Tạo token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         res.status(200).json({ message: 'Đăng nhập thành công!', token });
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi server.' });
//     }
// };

// module.exports = { register, login };

const authController = {
    register: async (req, res) => {
        const { name, email, password } = req.body;

        try {
            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng.' });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();

            res.status(201).json({ message: 'Đăng ký thành công!' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server.' });
        }
    },
    login: async (req, res) => {
        // Đăng nhập logic
        const { email, password } = req.body;

        try {
            // Tìm người dùng theo email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
            }

            // Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
            }

            // Tạo token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ message: 'Đăng nhập thành công!', token });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server.' });
        }
    }
};

module.exports = authController;
