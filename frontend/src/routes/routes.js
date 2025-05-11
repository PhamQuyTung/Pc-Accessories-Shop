import Home from '../pages/Home';
import About from '../pages/About';
import Product from '../pages/Product';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';
import Blog from '../pages/Blog';
import Login from '../pages/Login';
import Promotion from '../pages/Promotion';
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';

const routes = [
    { path: '/', element: <Home />, layout: MainLayout },
    { path: '/about', element: <About />, layout: MainLayout },
    { path: '/product', element: <Product />, layout: MainLayout },
    { path: '/cart', element: <Cart />, layout: MainLayout },
    { path: '/contact', element: <Contact />, layout: MainLayout },
    { path: '/blog', element: <Blog />, layout: MainLayout },
    { path: '/promotion', element: <Promotion />, layout: MainLayout },
    { path: '/login', element: <Login />, layout: AuthLayout },
];

export default routes;