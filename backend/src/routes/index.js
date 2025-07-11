// routes/index.js
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const accountRoutes = require('./accountRoutes');
const categoryRoutes = require('./categoryRoutes'); // ✔️ Đảm bảo đúng tên file
const errorHandle = require('../helpers/error.handle');

function route(app) {
    // Route cho trang chủ
    app.get('/', (req, res) => {
        res.render('home');
    });

    // Route chính
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/accounts', accountRoutes);
    app.use('/api/categories', categoryRoutes); // 👈 Đây là route bạn cần
    app.use('/api/menus', require('./menuRoutes')); // 👈 Thêm route cho menu

    // Middleware xử lý lỗi
    app.use(errorHandle);
}

module.exports = route;
