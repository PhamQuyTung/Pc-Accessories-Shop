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
import Blog from '~/pages/BlogPage/BlogPage';

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
import PromotionCollectionPage from '~/pages/PromotionsCollectionPage/PromotionsCollectionPage';
import QuickAccessPage from '~/pages/Admin/QuickAccessPage/QuickAccessPage';
import PostsPage from '~/pages/Admin/Post/PostsPage/PostsPage';
import CreatePostPage from '~/pages/Admin/Post/CreatePostPage/CreatePostPage';
import EditPostPage from '~/pages/Admin/Post/EditPostPage/EditPostPage';
import PostCategoryPage from '~/pages/Admin/Post/PostCategoryPage/PostCategoryPage';
import PostTagPage from '~/pages/Admin/Post/PostTagPage/PostTagPage';
import PostDetailPage from '~/pages/PostDetailPage/PostDetailPage';
import DraftPostsPage from '~/pages/Admin/Post/DraftPostsPage/DraftPostsPage';
import TrashPostsPage from '~/pages/Admin/Post/TrashPostsPage/TrashPostsPage';
import PostPreviewPage from '~/pages/Admin/Post/PostPreviewPage/PostPreviewPage';
import PostListCategoryPage from '~/pages/PostListCategoryPage/PostListCategoryPage';

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
            { path: '/categories/:slug', element: <CollectionsPage /> },
            // 👉 Thêm route cho promotions collections
            // 👉 Chia rõ ràng: nếu là promotion thì vào PromotionCollectionPage
            { path: '/collections/:slug', element: <PromotionCollectionPage /> },
            { path: '/promotion', element: <Promotion /> },
            { path: '/contact', element: <Contact /> },
            { path: '/blog', element: <Blog /> },
            { path: '/blog/category/:categorySlug/:postSlug', element: <PostDetailPage /> },
            { path: '/blog/category/:slug', element: <PostListCategoryPage /> },

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
            { index: true, element: <QuickAccessPage /> }, // 👈 Trang mặc định khi vào /admin
            { path: 'products', element: <ProductManagement /> },
            { path: 'products/create', element: <CreateProduct /> },
            { path: 'products/trash', element: <Trash /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'categories', element: <CategoryManagement /> },
            { path: 'attributes', element: <AttributeManagement /> },
            { path: 'attributes/:attributeId/terms', element: <AttributeTermPage /> },
            { path: 'attributes/assign', element: <AssignAttributeToCategory /> },
            { path: 'menus', element: <AdminMenuManagement /> },

            // Bài viết
            { path: 'posts', element: <PostsPage /> },
            { path: 'posts/create', element: <CreatePostPage /> },
            { path: 'posts/edit/:id', element: <EditPostPage /> },
            { path: 'post-categories', element: <PostCategoryPage /> },
            { path: 'post-tags', element: <PostTagPage /> },
            { path: 'posts/drafts', element: <DraftPostsPage /> },
            { path: 'posts/trash', element: <TrashPostsPage /> },
            { path: 'posts/preview/:id', element: <PostPreviewPage /> },

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
