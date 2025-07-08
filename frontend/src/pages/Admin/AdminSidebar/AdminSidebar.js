// src/pages/Admin/AdminSidebar/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.scss';
import classNames from 'classnames/bind';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 👈 thêm framer-motion
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const AdminSidebar = () => {
    const [showProductMenu, setShowProductMenu] = useState(true);

    const toggleProductMenu = () => setShowProductMenu((prev) => !prev);

    const location = useLocation();
    const isProductSectionActive =
        location.pathname.startsWith('/admin/products') ||
        location.pathname.startsWith('/admin/categories') ||
        location.pathname.startsWith('/admin/tags') ||
        location.pathname.startsWith('/admin/attributes');

    return (
        <div className={cx('AdminSidebar')}>
            {/* Nhóm Sản phẩm (accordion) */}
            <div className={cx('menu-group')}>
                <div
                    className={cx('accordion-header', {
                        active: isProductSectionActive || showProductMenu, // 👈 luôn active nếu đang mở hoặc đang ở route con
                    })}
                    onClick={toggleProductMenu}
                >
                    <span className={cx('group-title')}>
                        <FontAwesomeIcon icon={faBox} className={cx('custom-iconBox')}/>
                        Sản phẩm
                    </span>
                    {showProductMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {/* AnimatePresence sẽ giúp ẩn hiện mượt mà */}
                <AnimatePresence initial={false}>
                    {showProductMenu && (
                        <motion.div
                            className={cx('accordion-content')}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
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
