import Home from '../pages/Home/Home';
import About from '../pages/About';
import Product from '../pages/Product/Product';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';
import Blog from '../pages/Blog';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Promotion from '../pages/Promotion';
import MainLayout from '../layout/MainLayout/MainLayout';
import AuthLayout from '../layout/AuthLayout';
import ProductDetail from '../pages/Product/ProductDetail/ProductDetail'; // 👈 Tạo trang này
import CreateProduct from '../pages/CreateProduct/CreateProduct'; // tạo component này
import ProductManagement from '../pages/Admin/ProductManagement/ProductManagement';
import UserManagement from '../pages/Admin/AccountManagement/AccountManagement';
import AdminLayout from '../layout/AdminLayout/AdminLayout'; // layout riêng cho admin
import EditProduct from '../pages/EditProduct/EditProduct'; // Trang chỉnh sửa sản phẩm
import Trash from '../pages/Trash/Trash'; // Trang chỉnh sửa sản phẩm

const routes = [
    { path: '/', element: <Home />, layout: MainLayout },
    { path: '/about', element: <About />, layout: MainLayout },
    { path: '/product', element: <Product />, layout: MainLayout },

    // Route trang tạo sản phẩm
    { path: '/products/create', element: <CreateProduct />, layout: MainLayout },

    // Route chỉnh sửa sản phẩm theo ID
    { path: '/products/edit/:id', element: <EditProduct />, layout: MainLayout },

    // ✅ Route chi tiết sản phẩm PC theo slug
    { path: '/products/:slug', element: <ProductDetail />, layout: MainLayout },

    // --- Admin routes ---
    { path: '/admin/products', element: <ProductManagement />, layout: AdminLayout },
    { path: '/admin/users', element: <UserManagement />, layout: AdminLayout },

    // Trang thùng rác sản phẩm
    { path: '/admin/products/trash', element: <Trash />, layout: AdminLayout },

    { path: '/cart', element: <Cart />, layout: MainLayout },
    { path: '/contact', element: <Contact />, layout: MainLayout },
    { path: '/blog', element: <Blog />, layout: MainLayout },
    { path: '/promotion', element: <Promotion />, layout: MainLayout },
    { path: '/login', element: <Login />, layout: AuthLayout },
    { path: '/register', element: <Register />, layout: AuthLayout },
];

export default routes;
