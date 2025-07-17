import React, { useEffect, useState } from 'react';
import Logo from '~/assets/logo/logo4.png';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faPlusCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { EyeIcon, HandWaveIcon, ListItemIcon, OutTheDoor } from '~/components/Icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import { debounce } from 'lodash';
import { formatCurrency } from '~/utils/formatCurrency'; // Giả sử bạn có hàm này để định dạng tiền tệ

const cx = classNames.bind(styles);

const MySwal = withReactContent(Swal);

function Header() {
    const [menus, setMenus] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const fetchSearchResults = debounce(async (query) => {
        if (!query) return setSearchResults([]);

        try {
            const res = await axios.get(`http://localhost:5000/api/products/search?query=${query}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
        }
    }, 300);

    useEffect(() => {
        fetchSearchResults(searchTerm);
    }, [searchTerm]);

    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Nếu muốn cập nhật ngay khi đăng xuất ở cùng tab:
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:5000/api/auth/verify-token', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status !== 200) {
                    // Token hết hạn hoặc không hợp lệ
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');

                    // ✅ Hiển thị SweetAlert thông báo hết phiên
                    await MySwal.fire({
                        icon: 'warning',
                        title: 'Phiên đăng nhập đã hết hạn',
                        text: 'Vui lòng đăng nhập lại.',
                        confirmButtonText: 'Đồng ý',
                        timer: 4000,
                        timerProgressBar: true,
                    });

                    navigate('/login');
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra token:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');

                // ✅ Hiển thị lỗi nếu server không phản hồi
                await MySwal.fire({
                    icon: 'error',
                    title: 'Có lỗi xảy ra!',
                    text: 'Không thể xác minh phiên đăng nhập. Vui lòng thử lại.',
                    confirmButtonText: 'OK',
                });

                navigate('/login');
            }
        };

        checkToken();
    }, [navigate]);

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/menus')
            .then((res) => setMenus(res.data))
            .catch((err) => console.error('Lỗi khi lấy menu:', err));
    }, []);

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
            setUser({});
            navigate('/');
            window.location.reload(); // Thêm dòng này để reload toàn bộ app
        }
    };

    // Hàm đệ quy để hiển thị menu đa cấp
    const renderMenuTree = (menuList, parentId = null) => {
        const children = menuList.filter((item) => String(item.parent) === String(parentId));
        if (children.length === 0) return null;

        return (
            <ul className={cx('submenu')}>
                {children.map((child) => (
                    <li key={child._id} className={cx('submenu-item')}>
                        <a href={child.link}>{child.name}</a>
                        {/* Đệ quy hiển thị con */}
                        {renderMenuTree(menuList, child._id)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <header className={cx('header')}>
            <div className={cx('header-container')}>
                <div className={cx('header__top')}>
                    <Link to="/" className={cx('header__logo')}>
                        <img src={Logo} alt="Logo" />
                    </Link>

                    <div className={cx('search-wrapper')}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faMagnifyingGlass} className={cx('search-icon')} />

                        {searchResults.length > 0 && (
                            <div className={cx('search-dropdown')}>
                                <ul className={cx('search-product-list')}>
                                    {searchResults.map((item) => (
                                        <li
                                            key={item._id}
                                            onClick={() => {
                                                navigate(`/products/${item.slug}`);
                                                setSearchTerm('');
                                                setSearchResults([]);
                                            }}
                                        >
                                            <img src={item.images?.[0]} alt={item.name} />
                                            <div className={cx('info')}>
                                                <Link to={`/products/${item.slug}`} className={cx('link-product')}>
                                                    {item.name}
                                                </Link>
                                                <span className={cx('price')}>
                                                    {item.discountPrice ? (
                                                        <>
                                                            <span className={cx('discount')}>
                                                                {formatCurrency(item.discountPrice)}
                                                            </span>
                                                            <span className={cx('original')}>
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>{formatCurrency(item.price)}</span>
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {searchTerm && (
                                    <Link
                                        to={`/search?query=${encodeURIComponent(searchTerm)}`}
                                        className={cx('search-see-more')}
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSearchResults([]);
                                        }}
                                    >
                                        🔍 Xem thêm kết quả cho “{searchTerm}”
                                    </Link>
                                )}

                                <div className={cx('search-suggestions')}>
                                    <p>Gợi ý nhanh:</p>
                                    <div className={cx('tags')}>
                                        <span>Laptop gaming</span>
                                        <span>Chuột Logitech</span>
                                        <span>Bàn phím cơ</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nếu có user thì hiển thị tên user không thì hiển thị button đăng kí/đăng nhập */}
                    {user ? (
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

                                        {/* Chỉ có Admin mới đc vào hoặc thấy chức năng này */}
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

                                        {/* Chỉ có Admin mới đc vào hoặc thấy chức năng này */}
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
                                // visible
                            >
                                <div className={cx('header__user-box')}>
                                    <FontAwesomeIcon icon={faUser} className={cx('user-icon')} />
                                    <div className={cx('user-text')}>
                                        <span className={cx('name')}>{user.name}</span>
                                    </div>
                                </div>
                            </Tippy>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className={cx('header__text--login')}>
                                <Button outline Small>
                                    Đăng nhập
                                </Button>
                            </a>

                            <a href="/register" className={cx('header__text--login')}>
                                <Button primary2 Small>
                                    Đăng ký
                                </Button>
                            </a>
                        </>
                    )}
                </div>

                <div className={cx('header__nav')}>
                    {menus
                        .filter((menu) => !menu.parent) // chỉ menu cha (ví dụ: Trang chủ, Giới thiệu, Khuyến mãi)
                        .map((menu) => (
                            <div key={menu._id} className={cx('nav-item')}>
                                <a href={menu.link} className={cx('header__nav-link')}>
                                    {menu.name}
                                </a>

                                {/* Nếu có con thì mới render submenu */}
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
