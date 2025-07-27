import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import axiosClient from '~/utils/axiosClient';
import { getAvatarUrl } from '~/utils/avatar';

// Icons
import { FaUser, FaMapMarkerAlt, FaBox, FaHeart, FaSignOutAlt } from 'react-icons/fa';

const cx = classNames.bind(styles);

export default function ProfileLayout() {
    const navigate = useNavigate();

    const [user, _setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(!user); // nếu chưa có user trong LS thì show loading
    const [error, setError] = useState(null);

    // wrap setUser để luôn sync localStorage
    const setUserAndPersist = useCallback((u) => {
        _setUser(u);
        if (u) {
            localStorage.setItem('user', JSON.stringify(u));
        } else {
            localStorage.removeItem('user');
        }
    }, []);

    // fetch /accounts/me để làm tươi dữ liệu mỗi lần vào trang
    useEffect(() => {
        const fetchMe = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return; // chưa đăng nhập
                }

                const { data } = await axiosClient.get('/accounts/me');
                setUserAndPersist(data);
            } catch (err) {
                console.error('fetch /accounts/me error', err);
                if (err?.response?.status === 401) {
                    // token hết hạn / không hợp lệ -> auto logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError('Không thể tải thông tin tài khoản.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (loading) {
        return (
            <div className={cx('profile-container')}>
                <div className={cx('content')}>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={cx('profile-container')}>
                <div className={cx('content')}>
                    <p>Bạn chưa đăng nhập.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('profile-container')}>
            <div className={cx('sidebar')}>
                <div className={cx('avatar')}>
                    {/* Nếu có link avatar thì show img, ko thì show circle initials */}
                    {user.avatar ? (
                        <img
                            src={getAvatarUrl(user)}
                            alt="avatar"
                            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div className={cx('circle')}>
                            {(user.firstName || user.lastName || user.name || 'U')
                                .toString()
                                .trim()
                                .split(' ')
                                .map((s) => s[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                    )}

                    <h2>
                        {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.name || 'Tên người dùng'}
                    </h2>
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
                {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
                <Outlet context={{ user, setUser: setUserAndPersist }} />
            </div>
        </div>
    );
}
