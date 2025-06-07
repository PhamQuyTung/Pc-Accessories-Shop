import React, { useState } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const menuItems = [
    {
        title: 'Laptop',
        icon: <LapTopIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'PC Gaming',
        icon: <LapTopGamingIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'PC GVN',
        icon: <PCGVNIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Main, CPU, VGA',
        icon: <PCGVNIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Case, Nguồn, Tản nhiệt',
        icon: <PCGVNIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Ổ cứng, RAM, Thẻ nhớ',
        icon: <RAMIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Loa, Micro, Webcam',
        icon: <LoaIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Màn hình',
        icon: <ScreenIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Bàn phím',
        icon: <KeyBoardIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Chuột + Lót chuột',
        icon: <MouseIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Tai nghe',
        icon: <HeadPhoneIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Ghế - Bàn',
        icon: <CharIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Phần mềm, mạng',
        icon: <PrintIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Handheld, Console',
        icon: <ConsoleIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Phụ kiện',
        icon: <ConsoleIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
    {
        title: 'Dịch vụ và thông tin khác',
        icon: <BoxIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['ACER', 'ASUS', 'MSI', 'LENOVO', 'DELL', 'HP - Pavilion', 'LG - Gram'],
            },
            {
                title: 'Giá bán',
                items: ['Dưới 15 triệu', 'Từ 15 – 20 triệu', 'Trên 20 triệu'],
            },
            {
                title: 'Nhu cầu sử dụng',
                items: ['Đồ họa - Studio', 'Học sinh - sinh viên', 'Mỏng nhẹ cao cấp'],
            },
            {
                title: 'CPU Intel - AMD',
                items: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen'],
            },
            {
                title: 'Linh phụ kiện Laptop',
                items: ['Ram laptop', 'SSD laptop', 'Ổ cứng di động'],
            },
        ],
    },
];

function CFNav() {
    const [activeMenu, setActiveMenu] = useState(null);

    return (
        <nav className={cx('navbar')}>
            <div className={cx('menu-wrapper')} onMouseLeave={() => setActiveMenu(null)}>
                {/* Sidebar */}
                <div className={cx('menu-sidebar')}>
                    {menuItems.map((item, index) => (
                        <div key={index} className={cx('menu-item')} onMouseEnter={() => setActiveMenu(index)}>
                            <div className={cx('menu-item__wrap')}>
                                {item.icon}
                                <span>{item.title}</span>
                            </div>
                            <RightIcon className={cx('icon-right')} />
                        </div>
                    ))}
                </div>

                {/* Bridge (khoảng đệm để không bị mất hover khi rê từ sidebar sang mega-menu) */}
                {activeMenu !== null && menuItems[activeMenu]?.children && <div className={cx('menu-bridge')} />}

                {/* Mega Menu */}
                {activeMenu !== null && menuItems[activeMenu]?.children && (
                    <div className={cx('mega-menu')}>
                        {menuItems[activeMenu].children.map((column, colIndex) => (
                            <div key={colIndex} className={cx('menu-column')}>
                                <h4>{column.title}</h4>
                                <ul>
                                    {column.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default CFNav;
