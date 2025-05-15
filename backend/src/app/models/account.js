
// Import necessary modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Mã này định nghĩa một mô hình người dùng cho MongoDB sử dụng Mongoose.
// Nó bao gồm các trường như tên, email, mật khẩu và vai trò.
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

// Nó cũng bao gồm một phương thức để mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('account', userSchema); // Export the user model