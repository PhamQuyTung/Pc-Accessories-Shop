const authRoutes = require('./authRoutes');
// const productRoutes = require('./productRoutes');
// const adminRoutes = require('./adminRoutes'); // nếu có

function route(app) {
    // Route cho trang chủ
    app.get('/', (req, res) => {
        res.render('home'); // views/home.hbs
    });

    // Route cho đăng nhập, đăng ký
    console.log('Register route: ', authRoutes);
    app.use('/auth', authRoutes);

    // Route cho sản phẩm
    // app.use('/products', productRoutes);

    // Thêm các route khác nếu có
    // app.use('/admin', adminRoutes);
}

module.exports = route;
