import React, { useRef } from 'react';
import './header.css'; // Import file CSS để style
import Logo from '~/assets/logo/logo4.png'; // Import logo image
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom để sử dụng cho điều hướng
import Button from '~/components/Button'; // Import Button component nếu cần sử dụng
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon để sử dụng biểu tượng
import { faAngleDown, faAngleUp, faArrowDown, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Import biểu tượng tìm kiếm từ FontAwesome
import DropdownMenu from '~/components/DropdownMenu'; // Import DropdownMenu component nếu cần sử dụng

const productMenuItems = [
    { label: 'Laptop', href: '/products/laptops' },
    { label: 'Bàn phím', href: '/products/keyboards' },
    { label: 'Chuột', href: '/products/mice' },
    { label: 'Tai nghe', href: '/products/headphones' },
    { label: 'Tất cả sản phẩm', href: '/product' },
];

function Header() {
    const dropdownRef = useRef();

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

                    <a href="/login" className="header__text--login">
                        <Button outline Small>
                            Đăng nhập
                        </Button>
                    </a>

                    <a href="/register" className="header__text--login">
                        <Button primary2>Đăng ký</Button>
                    </a>
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
