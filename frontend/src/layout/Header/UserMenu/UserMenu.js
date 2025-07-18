import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import Swal from 'sweetalert2';
import classNames from 'classnames/bind';
import styles from './UserMenu.module.scss';
import { EyeIcon, HandWaveIcon, ListItemIcon, OutTheDoor } from '~/components/Icons';

const cx = classNames.bind(styles);

function UserMenu({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
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
            onLogout();
            navigate('/');
            window.location.reload();
        }
    };

    return (
        <div className={cx('header__user')}>
            <Tippy
                content={
                    <div className={cx('header__user-dropdown')}>
                        <Link to="/profile" className={cx('dropdown__greeting')}>
                            <HandWaveIcon />
                            <strong>Xin chào, {user.name}</strong>
                        </Link>

                        <Link to="/orders" className={cx('dropdown__item')}>
                            <ListItemIcon />
                            <span>Đơn hàng của tôi</span>
                        </Link>

                        <Link to="/recent" className={cx('dropdown__item')}>
                            <span className={cx('icon-wrapper')}>
                                <EyeIcon />
                            </span>
                            <span>Đã xem gần đây</span>
                        </Link>

                        {user.role === 'admin' && (
                            <NavLink
                                to="/admin/products/create"
                                className={({ isActive }) => cx('dropdown__item', { active: isActive })}
                            >
                                <span className={cx('icon-wrapper')}>
                                    <FontAwesomeIcon icon={faPlusCircle} />
                                </span>
                                <span>Thêm sản phẩm</span>
                            </NavLink>
                        )}

                        {user.role === 'admin' && (
                            <NavLink
                                to="/admin/products"
                                className={({ isActive }) => cx('dropdown__item', { active: isActive })}
                            >
                                <span className={cx('icon-wrapper')}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </span>
                                <span>My Admin</span>
                            </NavLink>
                        )}

                        <Link to="#" className={cx('dropdown__logout')} onClick={handleLogout}>
                            <OutTheDoor />
                            <span className={cx('logout')}>Đăng xuất</span>
                        </Link>
                    </div>
                }
                interactive={true}
                placement="bottom-end"
                offset={[0, 10]}
            >
                <div className={cx('header__user-box')}>
                    <FontAwesomeIcon icon={faUser} className={cx('user-icon')} />
                    <div className={cx('user-text')}>
                        <span className={cx('name')}>{user.name}</span>
                    </div>
                </div>
            </Tippy>
        </div>
    );
}

export default UserMenu;
