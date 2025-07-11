import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './AdminSidebar.module.scss';
import classNames from 'classnames/bind';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPalette } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const cx = classNames.bind(styles);

const AdminSidebar = () => {
    const location = useLocation();
    const [showProductMenu, setShowProductMenu] = useState(false);
    const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);

    // Tự động mở accordion nếu path phù hợp
    useEffect(() => {
        setShowProductMenu(
            location.pathname.startsWith('/admin/products') ||
                location.pathname.startsWith('/admin/categories') ||
                location.pathname.startsWith('/admin/tags') ||
                location.pathname.startsWith('/admin/attributes'),
        );

        setShowAppearanceMenu(
            location.pathname.startsWith('/admin/menus') ||
                location.pathname.startsWith('/admin/widgets') ||
                location.pathname.startsWith('/admin/appearance'),
        );
    }, [location.pathname]);

    // Xác định accordion nào đang active
    const isProductActive =
        location.pathname.startsWith('/admin/products') ||
        location.pathname.startsWith('/admin/categories') ||
        location.pathname.startsWith('/admin/tags') ||
        location.pathname.startsWith('/admin/attributes');

    const isAppearanceActive =
        location.pathname.startsWith('/admin/menus') ||
        location.pathname.startsWith('/admin/widgets') ||
        location.pathname.startsWith('/admin/appearance');

    return (
        <div className={cx('AdminSidebar')}>
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
                            <NavLink
                                to="/admin/products/trash"
                                className={({ isActive }) => cx('link', { active: isActive })}
                            >
                                Thùng rác sản phẩm
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
