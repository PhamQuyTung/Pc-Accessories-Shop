import React, { useRef } from 'react';
import Logo from '~/assets/logo/logo4.png';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleUp,
    faBox,
    faClockRotateLeft,
    faHand,
    faMagnifyingGlass,
    faRightFromBracket,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '~/components/DropdownMenu';
import Tippy from '@tippyjs/react';
import { EyeIcon, HandWaveIcon, ListItemIcon, OutTheDoor } from '~/components/Icons';

const cx = classNames.bind(styles);

// const productMenuItems = [
//     { label: 'Laptop', href: '/products/laptops' },
//     { label: 'Bàn phím', href: '/products/keyboards' },
//     { label: 'Chuột', href: '/products/mice' },
//     { label: 'Tai nghe', href: '/products/headphones' },
//     { label: 'Tất cả sản phẩm', href: '/product' },
// ];

const listService = [
    { label: 'Sửa chữa', href: '/service/repair' },
    { label: 'Lắp đặt tại nhà', href: '/service/installation' },
    { label: 'Chăm sóc khách hàng', href: '/service/support' },
];

function Header() {
    const dropdownRef = useRef();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu cần xác thực, gửi token ở header
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (err) {
            // Có thể toast lỗi nếu muốn
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // ✅ Chuyển hướng sau 1.5s
        setTimeout(() => navigate('/'), 1500);
        window.location.reload();
    };

    return (
        <header className={cx("header")}>
            <div className={cx("header-container")}>
                <div className={cx("header__top")}>
                    <Link to="/" className={cx("header__logo")}>
                        <img src={Logo} alt="Logo" />
                    </Link>

                    <form action="#" className={cx("header__search")}>
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." required />
                        <button type="submit" className={cx("header__search-icon")}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </form>

                    {/* Nếu có user thì hiển thị tên user không thì hiển thị button đăng kí/đăng nhập */}
                    {user ? (
                        <div className={cx("header__user")}>
                            <Tippy
                                content={
                                    <div className={cx("header__user-dropdown")}>
                                        <Link to="/profile" className={cx("dropdown__greeting")}>
                                            <HandWaveIcon />
                                            <strong>Xin chào, {user.name}</strong>
                                        </Link>

                                        <Link to="/orders" className={cx("dropdown__item")}>
                                            <ListItemIcon />
                                            <span>Đơn hàng của tôi</span>
                                        </Link>

                                        <Link to="/recent" className={cx("dropdown__item")}>
                                            <span className={cx("icon-wrapper")}>
                                                <EyeIcon />
                                            </span>
                                            <span>Đã xem gần đây</span>
                                        </Link>

                                        <Link to="#" className={cx("dropdown__logout")} onClick={handleLogout}>
                                            <OutTheDoor />
                                            <span className={cx("logout")}>Đăng xuất</span>
                                        </Link>
                                    </div>
                                }
                                interactive={true}
                                placement="bottom-end"
                                offset={[0, 10]}
                                // visible
                            >
                                <div className={cx("header__user-box")}>
                                    <FontAwesomeIcon icon={faUser} className={cx("user-icon")} />
                                    <div className={cx("user-text")}>
                                        <span className={cx("name")}>{user.name}</span>
                                    </div>
                                </div>
                            </Tippy>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className={cx("header__text--login")}>
                                <Button outline Small>
                                    Đăng nhập
                                </Button>
                            </a>

                            <a href="/register" className={cx("header__text--login")}>
                                <Button primary2>Đăng ký</Button>
                            </a>
                        </>
                    )}
                </div>

                <div className={cx("header__nav")}>
                    <a className={cx('header__nav-link')} href="/">Trang chủ</a>
                    <a className={cx('header__nav-link')} href="/about">Giới thiệu</a>
                    <a className={cx('header__nav-link')} href="/cart">Giỏ hàng</a>
                    <a className={cx('header__nav-link')} href="/contact">Liên hệ</a>
                    <a className={cx('header__nav-link')} href="/blog">Blog</a>
                    <a className={cx('header__nav-link')} href="/promotion">Khuyến mãi</a>
                    <span className={cx("header__nav--product")}>
                        <DropdownMenu ref={dropdownRef} title="Dịch vụ" items={listService} />
                        <FontAwesomeIcon icon={faAngleUp} className={cx("header__nav--icon")} />
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;
