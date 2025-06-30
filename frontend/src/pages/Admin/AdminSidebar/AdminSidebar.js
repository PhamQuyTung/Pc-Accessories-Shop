// src/components/admin/Sidebar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const AdminSidebar = () => (
    <div className={cx('AdminSidebar')}>
        <NavLink to="/admin/products" className={({ isActive }) => cx('link', { active: isActive })}>
            Quản lý sản phẩm
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => cx('link', { active: isActive })}>
            Quản lý người dùng
        </NavLink>

        <NavLink to="/admin/products/trash" className={({ isActive }) => cx('link', { active: isActive })}>
            Thùng rác sản phẩm
        </NavLink>

        <NavLink to="/" className={({ isActive }) => cx('link', { active: isActive })}>
            Quay về trang chủ
        </NavLink>
    </div>
);

export default AdminSidebar;
