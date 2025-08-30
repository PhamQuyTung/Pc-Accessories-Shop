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
import CollectionsPage from '~/pages/CollectionsPage/CollectionsPage';
import Promotion from '~/pages/Promotion';
import Contact from '~/pages/Contact';
import Blog from '~/pages/Blog';

import Login from '~/pages/Login/Login';
import Register from '~/pages/Register/Register';

import ProductManagement from '~/pages/Admin/ProductManagement/ProductManagement';
import CreateProduct from '~/pages/Admin/CreateProduct/CreateProduct';
import EditProduct from '~/pages/Admin/EditProduct/EditProduct';
import Trash from '~/pages/Trash/Trash';
import UserManagement from '~/pages/Admin/AccountManagement/AccountManagement';
import CategoryManagement from '~/pages/Admin/CategoryManagement/CategoryManagement';
import AttributeManagement from '~/pages/Admin/AttributeManagement/AttributeManagement';
import AssignAttributeToCategory from '~/pages/Admin/AssignAttributeToCategory/AssignAttributeToCategory';
import AttributeTermPage from '~/pages/Admin/AttributeTermPage/AttributeTermPage';
import AdminMenuManagement from '~/pages/Admin/AdminMenuManagement/AdminMenuManagement';
import PromotionManagement from '~/pages/Admin/Promotion/PromotionList/PromotionList';
import CreatePromotion from '~/pages/Admin/Promotion/PromotionForm/PromotionForm';
import PromotionDetail from '~/pages/Admin/Promotion/PromotionDetail/PromotionDetail';

import ProfileLayout from '~/pages/Profile/ProfileLayout';
import ProfileInfo from '~/pages/Profile/tabs/ProfileInfo/ProfileInfo';
import ProfileAddress from '~/pages/Profile/tabs/ProfileAddress';
import ProfileOrders from '~/pages/Profile/tabs/ProfileOrders';
import ProfileViewed from '~/pages/Profile/tabs/ProfileViewed/ProfileViewed';
import EditPromotion from '~/pages/Admin/Promotion/EditPromotion/EditPromotion';
import BrandManagement from '~/pages/Admin/BrandsPage/BrandsPage';
// import CreateBrand from '~/pages/Admin/BrandManagement/CreateBrand';
// import EditBrand from '~/pages/Admin/BrandManagement/EditBrand';

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
            { path: '/collections/:slug', element: <CollectionsPage /> },
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
            { path: 'attributes/:attributeId/terms', element: <AttributeTermPage /> },
            { path: 'attributes/assign', element: <AssignAttributeToCategory /> },
            { path: 'menus', element: <AdminMenuManagement /> },

            // 🎯 Chương trình khuyến mãi
            { path: 'promotions', element: <PromotionManagement /> }, // Danh sách 
            { path: 'promotions/new', element: <CreatePromotion /> }, // Thêm mới
            { path: 'promotions/:id', element: <PromotionDetail /> }, // Chi tiết CTKM
            { path: 'promotions/:id/edit', element: <EditPromotion /> }, // Sửa

            // Thương hiệu sản phẩm 
            { path: 'brands', element: <BrandManagement /> }, // Danh sách thương hiệu
        ],
    },

    // fallback
    { path: '*', element: <NotFoundPage /> },
];

export default routes;
