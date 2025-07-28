import MainLayout from '~/layout/MainLayout/MainLayout';
import AuthLayout from '~/layout/AuthLayout';
import AdminLayout from '~/layout/AdminLayout/AdminLayout';
import RequireAdmin from '~/components/RequireAdmin/RequireAdmin';

import Home from '~/pages/Home/Home';
import About from '~/pages/About';
import Product from '~/pages/Product/Product';
import ProductDetail from '~/pages/Product/ProductDetail/ProductDetail';
import CartPage from '~/pages/CartPage/CartPage';
import CheckoutPage from '~/pages/CheckoutPage/CheckoutPage';
import PaymentPage from '~/pages/PaymentPage/PaymentPage';
import OrdersSuccess from '~/pages/OrdersSuccess/OrdersSuccess';
import OrdersPage from '~/pages/OrdersPage/OrdersPage';
import SearchResultPage from '~/components/SearchResultPage/SearchResultPage';
import NotFoundPage from '~/pages/NotFoundPage/NotFoundPage';
import Promotion from '~/pages/Promotion';
import Contact from '~/pages/Contact';
import Blog from '~/pages/Blog';

import Login from '~/pages/Login/Login';
import Register from '~/pages/Register/Register';

import ProductManagement from '~/pages/Admin/ProductManagement/ProductManagement';
import CreateProduct from '~/pages/CreateProduct/CreateProduct';
import EditProduct from '~/pages/EditProduct/EditProduct';
import Trash from '~/pages/Trash/Trash';
import UserManagement from '~/pages/Admin/AccountManagement/AccountManagement';
import CategoryManagement from '~/pages/Admin/CategoryManagement/CategoryManagement';
import AttributeManagement from '~/pages/Admin/AttributeManagement/AttributeManagement';
import AssignAttributeToCategory from '~/pages/Admin/AssignAttributeToCategory/AssignAttributeToCategory';
import AdminMenuManagement from '~/pages/Admin/AdminMenuManagement/AdminMenuManagement';

import ProfileLayout from '~/pages/Profile/ProfileLayout';
import ProfileInfo from '~/pages/Profile/tabs/ProfileInfo/ProfileInfo';
import ProfileAddress from '~/pages/Profile/tabs/ProfileAddress';
import ProfileOrders from '~/pages/Profile/tabs/ProfileOrders';
import ProfileViewed from '~/pages/Profile/tabs/ProfileViewed/ProfileViewed';

const routes = [
    // ----- Front site (luôn có Header/Footer vì bọc MainLayout) -----
    {
        element: <MainLayout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/about', element: <About /> },
            { path: '/product', element: <Product /> },
            { path: '/products/:slug', element: <ProductDetail /> },
            { path: '/products/edit/:id', element: <EditProduct /> },
            { path: '/carts', element: <CartPage /> },
            { path: '/checkout', element: <CheckoutPage /> },
            { path: '/payment', element: <PaymentPage /> },
            { path: '/orders-success', element: <OrdersSuccess /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/search', element: <SearchResultPage /> },
            { path: '/promotion', element: <Promotion /> },
            { path: '/contact', element: <Contact /> },
            { path: '/blog', element: <Blog /> },

            // Profile nested dưới MainLayout để vẫn có Header/Footer
            {
                path: '/profile',
                element: <ProfileLayout />,
                children: [
                    { index: true, element: <ProfileInfo /> },
                    { path: 'address', element: <ProfileAddress /> },
                    { path: 'orders', element: <ProfileOrders /> },
                    { path: 'viewed', element: <ProfileViewed /> },
                ],
            },

            { path: '/404', element: <NotFoundPage /> },
        ],
    },

    // ----- Auth -----
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> },
        ],
    },

    // ----- Admin -----
    {
        path: '/admin',
        element: (
            <RequireAdmin>
                <AdminLayout />
            </RequireAdmin>
        ),
        children: [
            { path: 'products', element: <ProductManagement /> },
            { path: 'products/create', element: <CreateProduct /> },
            { path: 'products/trash', element: <Trash /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'categories', element: <CategoryManagement /> },
            { path: 'attributes', element: <AttributeManagement /> },
            { path: 'attributes/assign', element: <AssignAttributeToCategory /> },
            { path: 'menus', element: <AdminMenuManagement /> },
        ],
    },

    // fallback
    { path: '*', element: <NotFoundPage /> },
];

export default routes;
