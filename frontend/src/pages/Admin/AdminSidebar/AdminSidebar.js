import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AdminSidebar.module.scss';
import classNames from 'classnames/bind';
import { ChevronDown, ChevronRight, LayoutDashboard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPalette, faNewspaper, faClipboardList, faGift } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const cx = classNames.bind(styles);

const AdminSidebar = () => {
    const location = useLocation();
    const [showDashboardMenu, setShowDashboardMenu] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [showProductMenu, setShowProductMenu] = useState(false);
    const [showGiftMenu, setShowGiftMenu] = useState(false);
    const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
    const [showOrderMenu, setShowOrderMenu] = useState(false);

    useEffect(() => {
        // Dashboard mở khi ở /admin hoặc /admin/stats
        setShowDashboardMenu(location.pathname === '/admin' || location.pathname.startsWith('/admin/stats'));

        // Bài viết
        setShowPostMenu(
            location.pathname.startsWith('/admin/posts') ||
                location.pathname.startsWith('/admin/post-categories') ||
                location.pathname.startsWith('/admin/post-tags'),
        );

        // Sản phẩm
        setShowProductMenu(
            location.pathname.startsWith('/admin/products') ||
                location.pathname.startsWith('/admin/categories') ||
                location.pathname.startsWith('/admin/tags') ||
                location.pathname.startsWith('/admin/attributes') ||
                location.pathname.startsWith('/admin/brands'),
        );

        // Giao diện
        setShowAppearanceMenu(
            location.pathname.startsWith('/admin/menus') ||
                location.pathname.startsWith('/admin/widgets') ||
                location.pathname.startsWith('/admin/appearance'),
        );

        // Orders
        setShowOrderMenu(location.pathname.startsWith('/admin/orders'));

        // Gift
        setShowGiftMenu(
            location.pathname.startsWith('/admin/gifts') ||
                location.pathname.startsWith('/admin/promotions') ||
                location.pathname.startsWith('/admin/promotion-gifts') ||
                location.pathname.startsWith('/admin/promotion-supports'),
        );
    }, [location.pathname]);

    // Dashboard active
    const isDashboardActive = location.pathname === '/admin' || location.pathname.startsWith('/admin/stats');

    // Bài viết active
    const isPostActive =
        location.pathname.startsWith('/admin/posts') ||
        location.pathname.startsWith('/admin/post-categories') ||
        location.pathname.startsWith('/admin/post-tags');

    // Kiểm tra active cho từng nhóm sản phẩm
    const isProductActive =
        location.pathname.startsWith('/admin/products') ||
        location.pathname.startsWith('/admin/categories') ||
        location.pathname.startsWith('/admin/tags') ||
        location.pathname.startsWith('/admin/attributes') ||
        location.pathname.startsWith('/admin/brands');

    // Giao diện active
    const isAppearanceActive =
        location.pathname.startsWith('/admin/menus') ||
        location.pathname.startsWith('/admin/widgets') ||
        location.pathname.startsWith('/admin/appearance');

    // Orders active
    const isOrderActive = 
        location.pathname.startsWith('/admin/orders');

    // Gift active
    const isGiftActive =
        location.pathname.startsWith('/admin/gifts') ||
        location.pathname.startsWith('/admin/promotions') ||
        location.pathname.startsWith('/admin/promotion-gifts') ||
        location.pathname.startsWith('/admin/promotion-supports');

    return (
        <div className={cx('AdminSidebar')}>
            {/* Nhóm Dashboard */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isDashboardActive })}
                    onClick={() => setShowDashboardMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <LayoutDashboard size={16} className={cx('custom-iconBox')} />
                        Dashboard
                    </span>
                    {showDashboardMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showDashboardMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink to="/admin" end className={({ isActive }) => cx('link', { active: isActive })}>
                                Truy cập nhanh
                            </NavLink>
                            <NavLink to="/admin/stats" className={({ isActive }) => cx('link', { active: isActive })}>
                                Thống kê
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm Bài viết */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isPostActive })}
                    onClick={() => setShowPostMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faNewspaper} className={cx('custom-iconBox')} />
                        Bài viết
                    </span>
                    {showPostMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showPostMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink
                                to="/admin/posts"
                                end
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Tất cả bài viết
                            </NavLink>
                            <NavLink
                                to="/admin/posts/create"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Viết bài mới
                            </NavLink>
                            <NavLink
                                to="/admin/posts/drafts"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Bản nháp
                            </NavLink>
                            <NavLink
                                to="/admin/posts/trash"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thùng rác
                            </NavLink>
                            <NavLink
                                to="/admin/post-categories"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Chuyên mục
                            </NavLink>
                            <NavLink
                                to="/admin/post-tags"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thẻ
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm Sản phẩm */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isProductActive })}
                    onClick={() => setShowProductMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faBox} className={cx('custom-iconBox')} />
                        Sản phẩm
                    </span>
                    {showProductMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showProductMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink
                                to="/admin/products"
                                end
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Tất cả sản phẩm
                            </NavLink>
                            <NavLink
                                to="/admin/products/create"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thêm mới sản phẩm
                            </NavLink>
                            <NavLink
                                to="/admin/products/trash"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thùng rác sản phẩm
                            </NavLink>
                            <NavLink
                                to="/admin/categories"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Danh mục
                            </NavLink>
                            <NavLink to="/admin/tags" className={({ isActive }) => cx('link', { active: isActive })}>
                                Từ khóa
                            </NavLink>
                            <NavLink
                                to="/admin/attributes"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Các thuộc tính
                            </NavLink>
                            <NavLink to="/admin/brands" className={({ isActive }) => cx('link', { active: isActive })}>
                                Thương hiệu sản phẩm
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm ưu đãi */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isGiftActive })}
                    onClick={() => setShowGiftMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faGift} className={cx('custom-iconBox')} />
                        Ưu đãi
                    </span>
                    {showGiftMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showGiftMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink
                                to="/admin/gifts"
                                end
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Quà tặng
                            </NavLink>
                            <NavLink
                                to="/admin/promotions"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Chương trình khuyến mãi
                            </NavLink>
                            <NavLink
                                to="/admin/promotion-gifts"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Khuyến mãi đi kèm
                            </NavLink>
                            <NavLink
                                to="/admin/promotion-supports"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Ưu đãi hỗ trợ
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm Giao diện */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isAppearanceActive })}
                    onClick={() => setShowAppearanceMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faPalette} className={cx('custom-iconBox')} />
                        Giao diện
                    </span>
                    {showAppearanceMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showAppearanceMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink to="/admin/menus" className={({ isActive }) => cx('link', { active: isActive })}>
                                Quản lý menu
                            </NavLink>
                            <NavLink to="/admin/widgets" className={({ isActive }) => cx('link', { active: isActive })}>
                                Quản lý widget
                            </NavLink>
                            <NavLink
                                to="/admin/appearance"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Tùy chỉnh giao diện
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm Đơn hàng */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', { active: isOrderActive })}
                    onClick={() => setShowOrderMenu((prev) => !prev)}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faClipboardList} className={cx('custom-iconBox')} />
                        Đơn hàng
                    </span>
                    {showOrderMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence initial={false}>
                    {showOrderMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NavLink
                                to="/admin/orders"
                                end
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Tất cả đơn hàng
                            </NavLink>
                            <NavLink
                                to="/admin/orders/stats"
                                end
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Báo cáo đơn hàng
                            </NavLink>
                            <NavLink
                                to="/admin/orders/create"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thêm đơn hàng
                            </NavLink>
                            <NavLink
                                to="/admin/orders/trash"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thùng rác đơn hàng
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nhóm Khác */}
            <div className={cx('menu-group')}>
                <p className={cx('group-title')}>Khác</p>
                <NavLink to="/admin/users" className={({ isActive }) => cx('link', { active: isActive })}>
                    Quản lý người dùng
                </NavLink>
                <NavLink to="/" className={({ isActive }) => cx('link', { active: isActive })}>
                    Quay về trang chủ
                </NavLink>
            </div>
        </div>
    );
};

export default AdminSidebar;
