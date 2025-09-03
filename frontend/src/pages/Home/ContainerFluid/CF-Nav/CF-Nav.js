import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    LapTopIcon,
    LapTopGamingIcon,
    KeyBoardIcon,
    BoxIcon,
    CharIcon,
    ConsoleIcon,
    MouseIcon,
    HeadPhoneIcon,
    LoaIcon,
    PCGVNIcon,
    PrintIcon,
    RAMIcon,
    ScreenIcon,
    RightIcon,
    MousePadIcon,
} from '~/components/Icons';
import classNames from 'classnames/bind';
import styles from './CF-Nav.module.scss';

const cx = classNames.bind(styles);

function getCategoryIcon(slug) {
    switch (slug) {
        case 'laptop':
            return <LapTopIcon />;
        case 'laptop-gaming':
            return <LapTopGamingIcon />;
        case 'pc-gvn':
        case 'main-cpu-vga':
        case 'case-nguon-tan':
            return <PCGVNIcon />;
        case 'ban-phim':
            return <KeyBoardIcon />;
        case 'chuot-may-tinh':
            return <MouseIcon />;
        case 'lot-chuot':
            return <MousePadIcon />;
        case 'man-hinh':
            return <ScreenIcon />;
        case 'tai-nghe':
            return <HeadPhoneIcon />;
        case 'ghe-ban':
            return <CharIcon />;
        case 'may-choi-game':
        case 'handheld-console':
            return <ConsoleIcon />;
        case 'phan-mem-mang':
            return <PrintIcon />;
        case 'ocung-ram-the':
            return <RAMIcon />;
        case 'loa-mic-webcam':
            return <LoaIcon />;
        case 'phu-kien':
            return <BoxIcon />;
        default:
            return <BoxIcon />;
    }
}

function CFNav() {
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    function getCustomSlug(category, categoryMap) {
        if (!category.parent) return category.slug; // Nếu là cha: slug gốc

        const parent = categoryMap[category.parent];
        if (parent && !parent.parent) {
            return parent.slug; // Nếu là cấp 2 (con của cha): dùng slug của cha
        }

        if (parent && parent.parent) {
            const grandParent = categoryMap[parent.parent];
            if (grandParent) {
                return `${grandParent.slug}-${category.slug}`; // Nếu là cấp 3: cha-con -> gộp slug
            }
        }

        return category.slug; // fallback
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories/with-path');
                const flatCategories = res.data;

                // Tạo map ID -> category để truy xuất nhanh
                const categoryMap = {};
                flatCategories.forEach((cat) => {
                    categoryMap[cat._id] = { ...cat, submenus: [], href: '' }; // thêm href rỗng
                });

                // Gán submenus và href
                flatCategories.forEach((cat) => {
                    // Tính href dựa trên cấp
                    const hrefSlug = getCustomSlug(cat, categoryMap);
                    categoryMap[cat._id].href = `/categories/${hrefSlug}`;

                    // Gắn con vào cha
                    if (cat.parent) {
                        const parent = categoryMap[cat.parent];
                        if (parent) {
                            parent.submenus.push(categoryMap[cat._id]);
                        }
                    }
                });

                // Lọc ra danh mục cấp 1
                const topLevelMenus = flatCategories.filter((cat) => !cat.parent).map((cat) => categoryMap[cat._id]);
                setMenuItems(topLevelMenus);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className={cx('menu-wrapper')} onMouseLeave={() => setActiveMenu(null)}>
            {/* Sidebar */}
            <div className={cx('menu-sidebar')}>
                {menuItems.map((item, index) => (
                    <Link
                        to={item.href}
                        key={item._id}
                        className={cx('menu-item')}
                        onMouseEnter={() => setActiveMenu(index)}
                    >
                        <span className={cx('menu-item__wrap')}>
                            {getCategoryIcon(item.slug)}
                            <span>{item.name}</span>
                        </span>
                        <RightIcon className={cx('icon-right')} />
                    </Link>
                ))}
            </div>

            {/* Bridge */}
            {activeMenu !== null && menuItems[activeMenu]?.submenus?.length > 0 && (
                <div className={cx('menu-bridge')} />
            )}

            {/* Mega Menu */}
            {activeMenu !== null && menuItems[activeMenu]?.submenus?.length > 0 && (
                <div className={cx('mega-menu')}>
                    {menuItems[activeMenu].submenus.map((sub, i) => (
                        <div key={i} className={cx('menu-column')}>
                            <h4>
                                <Link to={sub.href}>{sub.name}</Link>
                            </h4>
                            {sub.submenus?.length > 0 &&
                                sub.submenus.map((child, j) => (
                                    <p key={j} className={cx('menu-item-sub')}>
                                        <Link to={child.href}>{child.name}</Link>
                                    </p>
                                ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CFNav;
