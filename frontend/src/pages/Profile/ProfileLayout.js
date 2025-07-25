import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';

// Icons
import { FaUser, FaMapMarkerAlt, FaBox, FaHeart, FaSignOutAlt } from 'react-icons/fa';

const cx = classNames.bind(styles);

export default function ProfileLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : {};
    });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = useCallback(async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất',
            text: 'Bạn có chắc chắn muốn đăng xuất không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
            window.location.reload();
        }
    }, [navigate]);

    return (
        <div className={cx('profile-container')}>
            <div className={cx('sidebar')}>
                <div className={cx('avatar')}>
                    <div className={cx('circle')}>{user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}</div>
                    <h2>{user.name || 'Tên người dùng'}</h2>
                </div>

                <ul className={cx('menu')}>
                    <li>
                        <NavLink to="/profile" end className={({ isActive }) => cx('menu-item', { active: isActive })}>
                            <FaUser className={cx('menu-icon')} />
                            <span className={cx('menu-text')}>Thông tin tài khoản</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/profile/address"
                            className={({ isActive }) => cx('menu-item', { active: isActive })}
                        >
                            <FaMapMarkerAlt className={cx('menu-icon')} />
                            <span className={cx('menu-text')}>Sổ địa chỉ</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/profile/orders"
                            className={({ isActive }) => cx('menu-item', { active: isActive })}
                        >
                            <FaBox className={cx('menu-icon')} />
                            <span className={cx('menu-text')}>Quản lý đơn hàng</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/profile/viewed"
                            className={({ isActive }) => cx('menu-item', { active: isActive })}
                        >
                            <FaHeart className={cx('menu-icon')} />
                            <span className={cx('menu-text')}>Sản phẩm đã thích</span>
                        </NavLink>
                    </li>

                    <li>
                        <button className={cx('logout-btn', 'menu-item')} onClick={handleLogout}>
                            <FaSignOutAlt className={cx('menu-icon')} />
                            <span className={cx('menu-text')}>Đăng xuất</span>
                        </button>
                    </li>
                </ul>
            </div>

            <div className={cx('content')}>
                <Outlet context={{ user, setUser }} />
            </div>
        </div>
    );
}
