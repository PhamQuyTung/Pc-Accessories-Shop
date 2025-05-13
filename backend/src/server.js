// src/server.js
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const validateMiddleware = require('./app/middlewares/validateMiddleware');
const authRoutes = require('./routes/authRoutes'); // Đảm bảo đúng đường dẫn
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Sử dụng dotenv để quản lý biến môi trường
dotenv.config();

// Khởi tạo ứng dụng
const app = express();

// Kết nối database
connectDB();

// Middlewares
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined'));
app.use(cookieParser());

// Sử dụng route auth
app.use('/auth', authRoutes); // Đảm bảo rằng authRoutes được sử dụng đúng

// Cấu hình view engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {}, // Các helper của bạn nếu có
    })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Lắng nghe server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
