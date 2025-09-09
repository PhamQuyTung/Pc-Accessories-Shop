// routes/index.js
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const accountRoutes = require('./accountRoutes');
const categoryRoutes = require('./categoryRoutes'); // ✔️ Đảm bảo đúng tên file
const menuRoutes = require('./menuRoutes'); // ✔️ Đảm bảo đúng tên file
const attributeRoutes = require('./attributeRoutes'); // ✔️ Thêm route cho attribute
const cartRoutes = require('./cartRoutes'); // ✔️ Thêm route cho carts
const orderRoutes = require('./orderRoutes'); // ✔️ Thêm route cho orders
const addressRoutes = require('./addressRoutes'); // ✔️ Thêm route cho address
const favoriteRoutes = require('./favoriteRoutes'); // ✔️ Thêm route cho favorites
const reviewRoutes = require("./reviewRoutes");
const attributeTermRoutes = require("./attributeTermRoutes");
const promotionsRoutes = require("./promotionsRoutes");
const brandRoutes = require("./brandRoutes");
const uploadRoutes = require("./uploadRoutes");
const postRoutes = require("./postRoutes"); 
const postCategoryRoutes = require("./postCategoryRoutes"); 
const postTagRoutes = require("./postTagRoutes"); 
const errorHandle = require('../helpers/error.handle');

function route(app) {
    // Route cho trang chủ
    app.get('/', (req, res) => {
        res.render('home');
    });

    // Route chính
    app.use('/api/upload', uploadRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/accounts', accountRoutes);
    app.use('/api/categories', categoryRoutes); // 👈 Đây là route bạn cần
    app.use('/api/attributes', attributeRoutes); // 👈 Thêm route cho attribute
    app.use('/api/menus', menuRoutes); // 👈 Thêm route cho menu
    app.use('/api/carts', cartRoutes); // 👈 Thêm route cho carts
    app.use('/api/orders', orderRoutes); // 👈 Thêm route cho orders
    app.use('/api/addresses', addressRoutes); // 👈 Thêm route cho address
    app.use('/api/favorites', favoriteRoutes); // 👈 Thêm route cho favorites
    app.use('/api/reviews', reviewRoutes); // 👈 Thêm route cho reviews
    app.use('/api/promotions', promotionsRoutes); // 👈 Thêm route cho promotions
    app.use('/api/attribute-terms', attributeTermRoutes); // 👈 Thêm route cho attribute-terms
    app.use('/api/brands', brandRoutes); // 👈 Thêm route cho brandRoutes
    app.use('/api/posts', postRoutes); // 👈 Thêm route cho postRoutes
    app.use('/api/post-categories', postCategoryRoutes); // 👈 Thêm route cho postCategoryRoutes
    app.use('/api/post-tags', postTagRoutes); // 👈 Thêm route cho postTagRoutes

    // Middleware xử lý lỗi
    app.use(errorHandle);
}

module.exports = route;
