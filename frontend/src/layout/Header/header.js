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
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

    const [menus, setMenus] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // ✅ Toggle menu responsive

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
                    {/* Nút menu (bars) */}
                    <button className={cx('menu-toggle')} onClick={toggleMenu}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className={cx('header__logo')}>
                        <img src={LogoFull} alt="TechVN" className={cx('logo-full')} />
                        <img src={LogoCompact} alt="TechVN Compact" className={cx('logo-compact')} />
                    </Link>

                    {/* Search bar */}
                    <div className={cx('search-wrapper')}>
                        <SearchBar navigate={navigate} />
                    </div>

                    {/* Cart icon (thay menu "Giỏ hàng") */}
                    <div className={cx('cart-icon')} onClick={() => navigate('/carts')}>
                        <FontAwesomeIcon icon={faCartShopping} />
                        {cartCount > 0 && <span className={cx('cart-badge')}>{cartCount}</span>}
                    </div>

                    <div className={cx('user-section')}>
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

                {/* Menu dropdown nav */}
                <nav className={cx('header__nav', { open: isMenuOpen })}>
                    {/* Navigation links */}
                    {menus
                        .filter((m) => !m.parent)
                        .map((menu) => (
                            <div key={menu._id} className={cx('nav-item')}>
                                <NavLink
                                    to={menu.link}
                                    className={({ isActive }) => cx('header__nav-link', { active: isActive })}
                                    end
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {menu.name}
                                </NavLink>
                                {menus.some((m) => String(m.parent) === String(menu._id)) &&
                                    renderMenuTree(menus, menu._id)}
                            </div>
                        ))}
                </nav>
            </div>
        </header>
    );
}

export default Header;
