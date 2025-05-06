import Home from '../pages/Home';
import Blog from '../pages/Blog';
import Product from '../pages/Product';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';

const routes = [
    { path: '/', element: <Home />, layout: MainLayout },
    { path: '/blog', element: <Blog />, layout: MainLayout },
    { path: '/product', element: <Product />, layout: MainLayout },
    { path: '/cart', element: <Cart />, layout: MainLayout },
    { path: '/login', element: <Login />, layout: AuthLayout },
];

export default routes;