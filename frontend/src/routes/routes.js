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

const routes = [
    { path: '/', element: <Home />, layout: MainLayout },
    { path: '/about', element: <About />, layout: MainLayout },
    { path: '/product', element: <Product />, layout: MainLayout },

    // Route trang tạo sản phẩm
    { path: '/products/create', element: <CreateProduct />, layout: MainLayout },

    // ✅ Route chi tiết sản phẩm PC theo slug
    { path: '/products/:slug', element: <ProductDetail />, layout: MainLayout },

    { path: '/cart', element: <Cart />, layout: MainLayout },
    { path: '/contact', element: <Contact />, layout: MainLayout },
    { path: '/blog', element: <Blog />, layout: MainLayout },
    { path: '/promotion', element: <Promotion />, layout: MainLayout },
    { path: '/login', element: <Login />, layout: AuthLayout },
    { path: '/register', element: <Register />, layout: AuthLayout },
];

export default routes;
