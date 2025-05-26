import React, { useRef } from 'react';
import './header.css';
import Logo from '~/assets/logo/logo4.png';
import { Link, useNavigate } from 'react-router-dom';
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

const productMenuItems = [
    { label: 'Laptop', href: '/products/laptops' },
    { label: 'Bàn phím', href: '/products/keyboards' },
    { label: 'Chuột', href: '/products/mice' },
    { label: 'Tai nghe', href: '/products/headphones' },
    { label: 'Tất cả sản phẩm', href: '/product' },
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
        <header className="header">
            <div className="header-container">
                <div className="header__top">
                    <Link to="/" className="header__logo">
                        <img src={Logo} alt="Logo" />
                    </Link>

                    <form action="#" className="header__search">
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." required />
                        <button type="submit" className="header__search-icon">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </form>

                    {/* Nếu có user thì hiển thị tên user không thì hiển thị button đăng kí/đăng nhập */}
                    {user ? (
                        <div className="header__user">
                            <Tippy
                                content={
                                    <div className="header__user-dropdown">
                                        <Link to="/profile" className="dropdown__greeting">
                                            <HandWaveIcon />
                                            <strong>Xin chào, {user.name}</strong>
                                        </Link>

                                        <Link to="/orders" className="dropdown__item">
                                            <ListItemIcon />
                                            <span>Đơn hàng của tôi</span>
                                        </Link>

                                        <Link to="/recent" className="dropdown__item">
                                            <span className="icon-wrapper">
                                                <EyeIcon />
                                            </span>
                                            <span>Đã xem gần đây</span>
                                        </Link>

                                        <Link to="#" className="dropdown__logout" onClick={handleLogout}>
                                            <OutTheDoor />
                                            <span className="logout">Đăng xuất</span>
                                        </Link>
                                    </div>
                                }
                                interactive={true}
                                placement="bottom-end"
                                offset={[0, 10]}
                                // visible
                            >
                                <div className="header__user-box">
                                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                                    <div className="user-text">
                                        <span className="name">{user.name}</span>
                                    </div>
                                </div>
                            </Tippy>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className="header__text--login">
                                <Button outline Small>
                                    Đăng nhập
                                </Button>
                            </a>

                            <a href="/register" className="header__text--login">
                                <Button primary2>Đăng ký</Button>
                            </a>
                        </>
                    )}
                </div>

                <div className="header__nav">
                    <a href="/">Trang chủ</a>
                    <a href="/about">Giới thiệu</a>
                    <span className="header__nav--product">
                        <DropdownMenu ref={dropdownRef} title="Sản phẩm" items={productMenuItems} />
                        <FontAwesomeIcon icon={faAngleUp} className="header__nav--icon" />
                    </span>
                    <a href="/cart">Giỏ hàng</a>
                    <a href="/contact">Liên hệ</a>
                    <a href="/blog">Blog</a>
                    <a href="/promotion">Khuyến mãi</a>
                </div>
            </div>
        </header>
    );
}

export default Header;
