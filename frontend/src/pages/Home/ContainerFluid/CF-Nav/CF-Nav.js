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
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
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
                items: ['ACER / PREDATOR', 'ASUS / ROG', 'MSI', 'LENOVO', 'DELL', 'GIGABYTE / AORUS', 'HP'],
            },
            {
                title: 'Giá bán',
                items: [
                    'Dưới 20 triệu',
                    'Từ 20 – 25 triệu',
                    'Từ 25 – 30 triệu',
                    'Trên 30 triệu',
                    'Gaming RTX 50 Series',
                ],
            },
            {
                title: 'ACER | PREDATOR',
                items: ['Nitro Series', 'Aspire Series', 'Predator Series', 'ACER RTX 50 Series'],
            },
            {
                title: 'ASUS | ROG Gaming',
                items: ['ROG Series', 'TUF Series', 'Zephyrus Series', 'ASUS RTX 50 Series'],
            },
            {
                title: 'MSI Gaming',
                items: [
                    'Titan GT Series',
                    'Stealth GS Series',
                    'Raider GE Series',
                    'Vector GP Series',
                    'Crosshair / Pulse GL Series',
                    'Sword / Katana GF66 Series',
                    'Cyborg / Thin GF Series',
                    'MSI RTX 50 Series',
                ],
            },
        ],
    },
    {
        title: 'PC GVN',
        icon: <PCGVNIcon />,
        children: [
            {
                title: 'PC RTX 50 SERIES',
                items: ['PC RTX 5090', 'PC RTX 5080', 'PC RTX 5070Ti', 'PC RTX 5070', 'PC RTX 5060Ti', 'PC RTX 5060'],
            },
            {
                title: 'PC HOT CHIẾN HẾ',
                items: [
                    'I5 - 5060 - 23TR',
                    'I5 - 4060 - 17TR',
                    'I5 - 3060 - 15TR',
                    'I3 - 3050 - 11TR',
                    'I3 - RX6500XT - 10TR',
                ],
            },
            {
                title: 'PC khuyến mãi KHỦNG',
                items: [
                    'BUILD PC TẶNG MÀN 240HZ',
                    'GVN x MSI - Tặng màn hình OLED',
                    'GVN x ASUS - Tặng màn hình OLED',
                    'GVN x CORSAIR - Tặng tản nhiệt 5TR',
                ],
            },
            {
                title: 'PC theo cấu hình VGA',
                items: ['PC RTX 3050', 'PC RX6500XT', 'PC RTX 3060 (12GB)', 'PC RTX 4060', 'PC RTX 4070 Super'],
            },
            {
                title: 'A.I PC - GVN',
                items: ['PC GVN X ASUS - PBA', 'PC GVN X MSI'],
            },
            {
                title: 'PC theo CPU Intel',
                items: ['PC Core I3', 'PC Core I5', 'PC Core I7', 'PC Core I9'],
            },
            {
                title: 'PC theo CPU Intel',
                items: ['PC Ultra 7', 'PC Ultra 9'],
            },
            {
                title: 'PC theo CPU AMD',
                items: ['PC AMD R3', 'PC AMD R5', 'PC AMD R7', 'PC AMD R9'],
            },
            {
                title: 'PC Văn phòng',
                items: [
                    'Homework Athlon - Chỉ từ 3.990K',
                    'Homework R3 - Chỉ từ 5,690K',
                    'Homework R5 - Chỉ từ 5,690K',
                    'Homework I5 - Chỉ từ 5,690K',
                ],
            },
            {
                title: 'Phần mềm bản quyền',
                items: ['Window bản quyền - Chỉ từ 2.990K', 'Office 365 bản quyền - Chỉ từ 990K'],
            },
        ],
    },
    {
        title: 'Main, CPU, VGA',
        icon: <PCGVNIcon />, // Thay thế bằng icon phù hợp nếu có
        children: [
            {
                title: 'VGA RTX 50 SERIES',
                items: ['RTX 5090', 'RTX 5080', 'RTX 5070Ti', 'RTX 5070', 'RTX 5060Ti', 'RTX 5060'],
            },
            {
                title: 'VGA (Trên 12 GB VRAM)',
                items: [
                    'RTX 4070 SUPER (12GB)',
                    'RTX 4070Ti SUPER (16GB)',
                    'RTX 4080 SUPER (16GB)',
                    'RTX 4090 SUPER (24GB)',
                ],
            },
            {
                title: 'VGA (Dưới 12 GB VRAM)',
                items: [
                    'RTX 4060Ti (8 + 16GB)',
                    'RTX 4060 (8GB)',
                    'RTX 3060 (12GB)',
                    'RTX 3050 (6 - 8GB)',
                    'GTX 1650 (4GB)',
                    'GT 710 / GT 1030 (2 - 4GB)',
                ],
            },
            {
                title: 'VGA - Card màn hình',
                items: ['NVIDIA Quadro', 'AMD Radeon'],
            },
            {
                title: 'Bo mạch chủ AMD',
                items: ['AMD X870 (Mới)', 'AMD X670', 'AMD X570', 'AMD B650 (Mới)', 'AMD A320', 'AMD TRX40'],
            },
            {
                title: 'Bo mạch chủ Intel',
                items: ['Z890 (Mới)', 'Z790', 'B760', 'H610', 'X299X', 'Xem tất cả'],
            },
            {
                title: 'CPU - Bộ vi xử lý Intel',
                items: [
                    'CPU Intel Core Ultra Series 2 (Mới)',
                    'CPU Intel 9',
                    'CPU Intel 7',
                    'CPU Intel 5',
                    'CPU Intel 3',
                ],
            },
            {
                title: 'CPU - Bộ vi xử lý AMD',
                items: ['CPU AMD Athlon', 'CPU AMD R3', 'CPU AMD R5', 'CPU AMD R7', 'CPU AMD R9'],
            },
        ],
    },
    {
        title: 'Case, Nguồn, Tản nhiệt',
        icon: <PCGVNIcon />, // Thay bằng icon phù hợp nếu có
        children: [
            {
                title: 'Case - Theo hãng',
                items: [
                    'Case ASUS',
                    'Case Corsair',
                    'Case Lianli',
                    'Case NZXT',
                    'Case Inwin',
                    'Case Thermaltake',
                    'Xem tất cả',
                ],
            },
            {
                title: 'Case - Theo giá',
                items: ['Dưới 1 triệu', 'Từ 1 triệu đến 2 triệu', 'Trên 2 triệu', 'Xem tất cả'],
            },
            {
                title: 'Nguồn - Theo hãng',
                items: ['Nguồn ASUS', 'Nguồn DeepCool', 'Nguồn Corsair', 'Nguồn NZXT', 'Nguồn MSI', 'Xem tất cả'],
            },
            {
                title: 'Nguồn - Theo công suất',
                items: ['Từ 400w - 500w', 'Từ 500w - 600w', 'Từ 700w - 800w', 'Trên 1000w', 'Xem tất cả'],
            },
            {
                title: 'Loại tản nhiệt',
                items: [
                    'Tản nhiệt AIO 240mm',
                    'Tản nhiệt AIO 280mm',
                    'Tản nhiệt AIO 360mm',
                    'Tản nhiệt AIO 420mm',
                    'Tản nhiệt khí',
                    'Fan RGB',
                    'Xem tất cả',
                ],
            },
            {
                title: 'Phụ kiện PC',
                items: ['Dây LED', 'Dây rise - Dụng VGA', 'Giá đỡ VGA', 'Keo tản nhiệt', 'Xem tất cả'],
            },
        ],
    },
    {
        title: 'Ổ cứng, RAM, Thẻ nhớ',
        icon: <RAMIcon />, // Thay bằng icon thực tế nếu có
        children: [
            {
                title: 'Dung lượng RAM',
                items: ['8 GB', '16 GB', '32 GB', '64 GB', 'Xem tất cả'],
            },
            {
                title: 'Loại RAM',
                items: ['DDR4', 'DDR5', 'Xem tất cả'],
            },
            {
                title: 'Hãng RAM',
                items: ['Corsair', 'Kingston', 'G.Skill', 'PNY', 'Xem tất cả'],
            },
            {
                title: 'Dung lượng SSD',
                items: [
                    '120GB - 128GB',
                    '250GB - 256GB',
                    '480GB - 512GB',
                    '960GB - 1TB',
                    '2TB',
                    'Trên 2TB',
                    'Xem tất cả',
                ],
            },
            {
                title: 'Hãng SSD',
                items: ['Samsung', 'Wester Digital', 'Kingston', 'Corsair', 'PNY', 'Xem tất cả'],
            },
            {
                title: 'Dung lượng HDD',
                items: ['HDD 1 TB', 'HDD 2 TB', 'HDD 4 TB - 6 TB', 'HDD trên 8 TB', 'Xem tất cả'],
            },
            {
                title: 'Hãng HDD',
                items: ['WesterDigital', 'Seagate', 'Toshiba', 'Xem tất cả'],
            },
            {
                title: 'Thẻ nhớ / USB',
                items: ['Sandisk'],
            },
            {
                title: 'Ổ cứng di động',
                items: [],
            },
        ],
    },
    {
        title: 'Loa, Micro, Webcam',
        icon: <LoaIcon />,
        children: [
            {
                title: 'Thương hiệu loa',
                items: ['Edifier', 'Razer', 'Logitech', 'SoundMax'],
            },
            {
                title: 'Kiểu Loa',
                items: ['Loa vi tính', 'Loa Bluetooth', 'Loa Soundbar', 'Loa mini', 'Sub phụ (Loa trầm)'],
            },
            {
                title: 'Webcam',
                items: ['Độ phân giải 4k', 'Độ phân giải Full HD (1080p)', 'Độ phân giải 720p'],
            },
            {
                title: 'Microphone',
                items: ['Micro HyperX'],
            },
        ],
    },
    {
        title: 'Màn hình',
        icon: <ScreenIcon />,
        children: [
            {
                title: 'Hãng sản xuất',
                items: ['LG', 'Asus', 'ViewSonic', 'Dell', 'Gigabyte', 'AOC', 'Acer', 'HKC'],
            },
            {
                title: 'Hãng sản xuất',
                items: ['MSI', 'Lenovo', 'Samsung', 'Philips', 'E-Dra', 'Dahua', 'KOORUI'],
            },
            {
                title: 'Giá tiền',
                items: [
                    'Dưới 5 triệu',
                    'Từ 5 triệu đến 10 triệu',
                    'Từ 10 triệu đến 20 triệu',
                    'Từ 20 triệu đến 30 triệu',
                    'Trên 30 triệu',
                ],
            },
            {
                title: 'Độ Phân giải',
                items: ['Màn hình Full HD', 'Màn hình 2K 1440p', 'Màn hình 4K UHD', 'Màn hình 6K'],
            },
            {
                title: 'Tần số quét',
                items: ['60Hz', '75Hz', '100Hz', '144Hz', '240Hz'],
            },
            {
                title: 'Màn hình cong',
                items: ['24" Curved', '27" Curved', '32" Curved', 'Trên 32" Curved'],
            },
            {
                title: 'Kích thước',
                items: [
                    'Màn hình 22"',
                    'Màn hình 24"',
                    'Màn hình 27"',
                    'Màn hình 29"',
                    'Màn hình 32"',
                    'Màn hình Trên 32"',
                    'Hỗ trợ giá treo (VESA)',
                ],
            },
            {
                title: 'Màn hình đồ họa',
                items: ['Màn hình đồ họa 24"', 'Màn hình đồ họa 27"', 'Màn hình đồ họa 32"'],
            },
            {
                title: 'Phụ kiện màn hình',
                items: ['Giá treo màn hình', 'Phụ kiện dây HDMI,DP,LAN'],
            },
            {
                title: 'Màn hình di động',
                items: ['Full HD 1080p', '2K 1440p', 'Có cảm ứng'],
            },
        ],
    },
    {
        title: 'Bàn phím',
        icon: <KeyBoardIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: [
                    'AKKO',
                    'AULA',
                    'Dare-U',
                    'Durgod',
                    'Leobog',
                    'FL-Esports',
                    'Corsair',
                    'E-Dra',
                    'Ciddo',
                    'Machenike',
                    'ASUS',
                    'Logitech',
                    'Razer',
                    'Leopold',
                    'Steelseries',
                    'Rapoo',
                    'VGN',
                ],
            },
            {
                title: 'Giá tiền',
                items: ['Dưới 1 triệu', '1 triệu - 2 triệu', '2 triệu - 3 triệu', '3 triệu - 4 triệu', 'Trên 4 triệu'],
            },
            {
                title: 'Kết nối',
                items: ['Bluetooth', 'Wireless'],
            },
            {
                title: 'Phụ kiện bàn phím cơ',
                items: ['Keycaps', 'Dwarf Factory', 'Kê tay'],
            },
        ],
    },
    {
        title: 'Chuột + Lót chuột',
        icon: <MouseIcon />,
        children: [
            {
                title: 'Thương hiệu chuột',
                items: ['Logitech', 'Razer', 'Corsair', 'Pulsar', 'Microsoft', 'Dare U'],
            },
            {
                title: 'Thương hiệu chuột',
                items: ['ASUS', 'Steelseries', 'Glorious', 'Rapoo'],
            },
            {
                title: 'Chuột theo giá tiền',
                items: [
                    'Dưới 500 nghìn',
                    'Từ 500 nghìn - 1 triệu',
                    'Từ 1 triệu - 2 triệu',
                    'Trên 2 triệu - 3 triệu',
                    'Trên 3 triệu',
                ],
            },
            {
                title: 'Loại Chuột',
                items: ['Chuột chơi game', 'Chuột văn phòng'],
            },
            {
                title: 'Logitech',
                items: ['Logitech Gaming', 'Logitech Văn phòng'],
            },
            {
                title: 'Thương hiệu lót chuột',
                items: ['GEARVN', 'ASUS', 'Steelseries', 'Dare-U', 'Razer'],
            },
            {
                title: 'Các loại lót chuột',
                items: ['Mềm', 'Cứng', 'Dày', 'Mỏng', 'Viền có led'],
            },
            {
                title: 'Lót chuột theo size',
                items: ['Nhỏ', 'Vừa', 'Lớn'],
            },
        ],
    },
    {
        title: 'Tai nghe',
        icon: <HeadPhoneIcon />,
        children: [
            {
                title: 'Thương hiệu',
                items: ['Asus', 'HyperX', 'Corsair', 'Razer', 'Steelseries', 'Rapoo', 'Logitech', 'Edifier'],
            },
            {
                title: 'Giá',
                items: [
                    'Tai nghe dưới 1 triệu',
                    'Tai nghe từ 1 triệu đến 2 triệu',
                    'Tai nghe từ 2 triệu đến 3 triệu',
                    'Tai nghe từ 3 triệu đến 4 triệu',
                    'Tai nghe trên 4 triệu',
                ],
            },
            {
                title: 'Kiểu kết nối',
                items: ['Tai nghe Wireless', 'Tai nghe Bluetooth', 'Dây cáp mạng'],
            },
            {
                title: 'Kiểu tai nghe',
                items: ['Tai nghe Over-ear', 'Tai nghe Gaming In-ear'],
            },
        ],
    },
    {
        title: 'Ghế - Bàn',
        icon: <CharIcon />,
        children: [
            {
                title: 'Thương hiệu ghế Gaming',
                items: ['Corsair', 'Warrior', 'E-DRA', 'DXRacer', 'Cougar', 'AKRacing'],
            },
            {
                title: 'Thương hiệu ghế CTH',
                items: ['Warrior', 'Sihoo', 'E-Dra'],
            },
            {
                title: 'Kiểu ghế',
                items: ['Ghế Công thái học', 'Ghế Gaming'],
            },
            {
                title: 'Bàn Gaming',
                items: ['Bàn Gaming DXRacer', 'Bàn Gaming E-Dra', 'Bàn Gaming Warrior'],
            },
            {
                title: 'Bàn công thái học',
                items: ['Bàn CTH Warrior', 'Phụ kiện bàn ghế'],
            },
            {
                title: 'Giá tiền',
                items: ['Dưới 5 triệu', 'Từ 5 đến 10 triệu', 'Trên 10 triệu'],
            },
        ],
    },
    {
        title: 'Phần mềm, mạng',
        icon: <PrintIcon />,
        children: [
            {
                title: 'Hãng sản xuất',
                items: ['Asus', 'LinkSys', 'TP-LINK', 'Mercusys'],
            },
            {
                title: 'Router Wi-Fi',
                items: ['Gaming', 'Phổ thông', 'Xuyên tường', 'Router Mesh Pack', 'Router WiFi 5', 'Router WiFi 6'],
            },
            {
                title: 'USB Thu sóng - Card mạng',
                items: ['Usb WiFi', 'Card WiFi', 'Dây cáp mạng'],
            },
            {
                title: 'Microsoft Office',
                items: ['Microsoft Office 365', 'Office Home 2024'],
            },
            {
                title: 'Microsoft Windows',
                items: ['Windows 11 Home', 'Windows 11 Pro'],
            },
        ],
    },
    {
        title: 'Handheld, Console',
        icon: <ConsoleIcon />,
        children: [
            {
                title: 'Handheld PC',
                items: ['Rog Ally', 'MSI Claw', 'Legion Go'],
            },
            {
                title: 'Tay cầm',
                items: ['Tay cầm Playstation', 'Tay cầm Rapoo', 'Tay cầm DareU', 'Xem tất cả'],
            },
            {
                title: 'Vô lăng lái xe, máy bay',
                items: [],
            },
            {
                title: 'Sony Playstation',
                items: ['Sony PS5 (Máy) chính hãng', 'Tay cầm chính hãng'],
            },
        ],
    },
    {
        title: 'Phụ kiện',
        icon: <ConsoleIcon />,
        children: [
            {
                title: 'Hub, sạc, cáp',
                items: ['Hub chuyển đổi', 'Dây cáp', 'Củ sạc'],
            },
            {
                title: 'Quạt cầm tay, Quạt mini',
                items: ['Jisulife'],
            },
            {
                title: 'Phụ kiện Elgato',
                items: [],
            },
        ],
    },
    {
        title: 'Dịch vụ và thông tin khác',
        icon: <BoxIcon />,
        children: [
            {
                title: 'Dịch vụ',
                items: ['Dịch vụ kỹ thuật tại nhà', 'Dịch vụ sửa chữa'],
            },
            {
                title: 'Chính sách',
                items: [
                    'Chính sách & bảng giá thu VGA qua sử dụng',
                    'Chính sách bảo hành',
                    'Chính sách giao hàng',
                    'Chính sách đổi trả',
                ],
            },
            {
                title: 'Build PC',
                items: [],
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
