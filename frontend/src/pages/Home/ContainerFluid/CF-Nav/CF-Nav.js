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
            return <PCGVNIcon />;
        case 'main-cpu-vga':
            return <PCGVNIcon />;
        case 'case-nguon-tan':
            return <PCGVNIcon />;
        case 'ban-phim':
            return <KeyBoardIcon />;
        case 'chuot-lot':
            return <MouseIcon />;
        case 'man-hinh':
            return <ScreenIcon />;
        case 'tai-nghe':
            return <HeadPhoneIcon />;
        case 'ghe-ban':
            return <CharIcon />;
        case 'may-choi-game':
            return <ConsoleIcon />;
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
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories/nested');
                setCategories(res.data);
                console.log('Categories:', res.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            }
        };

        fetchCategories();
    }, []);

    const menuItems = categories.map((cat) => ({
        id: cat._id,
        title: cat.name,
        icon: getCategoryIcon(cat.slug),
        href: `/danh-muc/${cat.slug}`,
        submenus:
            cat.children?.map((sub) => ({
                title: sub.name,
                href: `/danh-muc/${sub.slug}`,
            })) || [],
    }));

    return (
        <div className={cx('menu-wrapper')} onMouseLeave={() => setActiveMenu(null)}>
            {/* Sidebar */}
            <div className={cx('menu-sidebar')}>
                {menuItems.map((item, index) => (
                    <Link
                        to={item.href}
                        key={index}
                        className={cx('menu-item')}
                        onMouseEnter={() => setActiveMenu(index)}
                    >
                        <span className={cx('menu-item__wrap')}>
                            {item.icon}
                            <span>{item.title}</span>
                        </span>
                        <RightIcon className={cx('icon-right')} />
                    </Link>
                ))}
            </div>

            {/* Bridge */}
            {activeMenu !== null && menuItems[activeMenu]?.submenus?.length > 0 && (
                <div className={cx('menu-bridge')} />
            )}

            {/* Mega Menu hiển thị submenu (menu con) nếu có */}
            {activeMenu !== null && menuItems[activeMenu]?.submenus.length > 0 && (
                <div className={cx('mega-menu')}>
                    {menuItems[activeMenu].submenus.map((sub, i) => (
                        <div key={i} className={cx('menu-column')}>
                            <h4>
                                <Link to={sub.href}>{sub.title}</Link>
                            </h4>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CFNav;
