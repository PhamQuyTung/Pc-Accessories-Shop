import React, { useEffect, useState, useCallback } from 'react';
import Logo from '~/assets/logo/logo4.png';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Button from '~/components/Button';
import SearchBar from './SearchBar/SearchBar';
import UserMenu from './UserMenu/UserMenu';
import { fetchMenus } from '~/services/menuService';

const cx = classNames.bind(styles);

function Header() {
    const [menus, setMenus] = useState([]);
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // Lắng nghe thay đổi localStorage (đa tab)
    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Theo dõi localStorage hiện tại (trong 1 tab)
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Kiểm tra token hợp lệ
    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:5000/api/auth/verify-token', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status !== 200) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        checkToken();
    }, [navigate]);

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

    return (
        <header className={cx('header')}>
            <div className={cx('header-container')}>
                {/* Header top */}
                <div className={cx('header__top')}>
                    <Link to="/" className={cx('header__logo')}>
                        <img src={Logo} alt="Logo" />
                    </Link>

                    {/* Search bar  */}
                    <SearchBar navigate={navigate} />

                    {/* UserMenu */}
                    {user ? (
                        <UserMenu user={user} onLogout={() => setUser(null)} />
                    ) : (
                        <>
                            <Link to="/login" className={cx('header__text--login')}>
                                <Button outline Small>
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link to="/register" className={cx('header__text--login')}>
                                <Button primary2 Small>
                                    Đăng ký
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Header nav */}
                <div className={cx('header__nav')}>
                    {menus
                        .filter((m) => !m.parent)
                        .map((menu) => (
                            <div key={menu._id} className={cx('nav-item')}>
                                <NavLink
                                    to={menu.link}
                                    className={({ isActive }) => cx('header__nav-link', { active: isActive })}
                                    end // chỉ active khi URL khớp chính xác
                                >
                                    {menu.name}
                                </NavLink>

                                {menus.some((m) => String(m.parent) === String(menu._id)) &&
                                    renderMenuTree(menus, menu._id)}
                            </div>
                        ))}
                </div>
            </div>
        </header>
    );
}

export default Header;
