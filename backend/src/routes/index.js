const authRoutes = require('./authRoutes');
const errorHandle = require('../helpers/error.handle');
const productRoutes = require('./productRoutes');
const accountRoutes = require('./accountRoutes');
// const adminRoutes = require('./adminRoutes'); // nếu có

function route(app) {
    // Route cho trang chủ
    app.get('/', (req, res) => {
        res.render('home'); // views/home.hbs
    });

    // Route cho đăng nhập, đăng ký
    console.log('Register route: ', authRoutes);
    app.use('/api/auth', authRoutes);

    // Trung tâm xử lý lỗi của website
    app.use(errorHandle);

    // Route cho sản phẩm
    app.use('/api/products', productRoutes);

    // Route cho tài khoản
    console.log('Account route: ', accountRoutes);
    app.use('/api/accounts', accountRoutes);

    // Thêm các route khác nếu có
    // app.use('/admin', adminRoutes);
}

module.exports = route;
