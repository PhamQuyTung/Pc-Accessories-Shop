import React, { useEffect, useState, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Menu, X } from 'lucide-react'; // icon cho responsive
import styles from './Header.module.scss';

import LogoFull from '~/assets/logo/Logo-Full3.png';
import LogoCompact from '~/assets/logo/Logo-Compact.png';
import Button from '~/components/Button';
import SearchBar from './SearchBar/SearchBar';
import UserMenu from './UserMenu/UserMenu';
import { fetchMenus } from '~/services/menuService';
import cartEvent from '~/utils/cartEvent';
import axiosClient from '~/utils/axiosClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCartShopping, faHeadphones, faLocation } from '@fortawesome/free-solid-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import MobileMenuModal from './MobileMenuModal/MobileMenuModal'; // add this import near other imports

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

    const [menus, setMenus] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // ✅ Toggle menu responsive
    const [cartCount, setCartCount] = useState(0);

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // ✅ Lấy số lượng cart
    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const res = await axiosClient.get('/carts/');
                const items = res.data.items || [];
                setCartCount(items.length);
            } catch (err) {
                console.error('Lỗi lấy cart count:', err);
            }
        };
        fetchCartCount();
        cartEvent.on('update-cart-count', fetchCartCount);
        return () => cartEvent.off('update-cart-count', fetchCartCount);
    }, []);

    // ✅ Đồng bộ user giữa các tab
    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // ✅ Kiểm tra token
    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axiosClient.get('/auth/verify-token');
                if (res.status !== 200) throw new Error('Token không hợp lệ');
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        checkToken();
    }, [navigate]);

    // ✅ Fetch menu
    useEffect(() => {
        fetchMenus()
            .then(setMenus)
            .catch((err) => console.error('Lỗi khi lấy menu:', err));
    }, []);

    const renderMenuTree = useCallback((menuList, parentId = null) => {
        const children = menuList.filter((item) => String(item.parent) === String(parentId));
        if (!children.length) return null;

        return (
            <ul className={cx('submenu')}>
                {children.map((child) => (
                    <li key={child._id} className={cx('submenu-item')}>
                        <a href={child.link}>{child.name}</a>
                        {renderMenuTree(menuList, child._id)}
                    </li>
                ))}
            </ul>
        );
    }, []);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <header className={cx('header')}>
            <div className={cx('header-container')}>
                <div className={cx('header__top')}>
                    {/* Bars Display Mobile */}
                    <button className={cx('menu-toggle')} onClick={toggleMenu}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className={cx('header__logo')}>
                        <img src={LogoFull} alt="TechVN" className={cx('logo-full')} />
                        <img src={LogoCompact} alt="TechVN Compact" className={cx('logo-compact')} />
                    </Link>

                    {/* Thanh tìm kiếm */}
                    <div className={cx('search-wrapper')}>
                        <SearchBar navigate={navigate} />
                    </div>

                    {/* Khu vực thông tin bên phải (giống GEARVN) */}
                    <div className={cx('header__actions')}>
                        {/* Hotline */}
                        <div className={cx('header__item')}>
                            <FontAwesomeIcon icon={faHeadphones} />
                            <div className={cx('header__item--text')}>
                                <span>Hotline</span>
                                <strong>1900.5301</strong>
                            </div>
                        </div>

                        {/* Hệ thống showroom */}
                        <div className={cx('header__item')}>
                            <FontAwesomeIcon icon={faLocation} />
                            <div className={cx('header__item--text')}>
                                <span>Hệ thống</span>
                                <strong>Showroom</strong>
                            </div>
                        </div>

                        {/* Tra cứu đơn hàng */}
                        <div className={cx('header__item')} onClick={() => navigate('/profile/orders')}>
                            <FontAwesomeIcon icon={faClipboard} />
                            <div className={cx('header__item--text')}>
                                <span>Tra cứu</span>
                                <strong>Đơn hàng</strong>
                            </div>
                        </div>

                        {/* Giỏ hàng */}
                        <div className={cx('header__item', 'cart')} onClick={() => navigate('/carts')}>
                            <FontAwesomeIcon icon={faCartShopping} />
                            <div className={cx('header__item--text')}>
                                <span>Giỏ hàng</span>
                                <strong>{cartCount || 0} sản phẩm</strong>
                            </div>
                            {cartCount > 0 && <span className={cx('cart-badge')}>{cartCount}</span>}
                        </div>

                        {/* User */}
                        <div className={cx('header__item', 'user')}>
                            {user ? (
                                <UserMenu user={user} onLogout={() => setUser(null)} />
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button outline Small>
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button primary2 Small>
                                            Đăng ký
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile modal (slide-in) */}
            <MobileMenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} menus={menus} />
        </header>
    );
}

export default Header;
