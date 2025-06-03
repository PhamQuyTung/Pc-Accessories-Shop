import styles from './CF-Nav.module.scss';
import classNames from 'classnames/bind';
import {
    LapTopIcon, LapTopGamingIcon, KeyBoardIcon, MouseIcon,
    HeadPhoneIcon, CharIcon, PCGVNIcon, RAMIcon, LoaIcon,
    ScreenIcon, PrintIcon, ConsoleIcon, BoxIcon,
} from '~/components/Icons';
import MenuItem from '~/components/MenuItem/MenuItem';

const cx = classNames.bind(styles);

const listNavigation = [
    {
        icon: <LapTopIcon />,
        label: 'Laptop',
        children: [
            {
                label: 'Thương hiệu',
                path: '/collections/laptop',
                children: [
                    { label: 'Asus', path: '/collections/laptop/asus' },
                    { label: 'Acer', path: '/collections/laptop/acer' },
                    { label: 'Lenovo', path: '/collections/laptop/lenovo' },
                ],
            },
            {
                label: 'Giá bán',
                path: '/collections/laptop',
                children: [
                    { label: 'Dưới 15 triệu', path: '/collections/laptop/duoi-15-trieu' },
                    { label: 'Từ 15 đến 20 triệu', path: '/collections/laptop/15-20-trieu' },
                    { label: 'Trên 20 triệu', path: '/collections/laptop/tren-20-trieu' },
                ],
            },
            {
                label: 'CPU Intel - AMD',
                path: '/collections/laptop',
                children: [
                    { label: 'Intel Core i3', path: '/collections/laptop/core-i3' },
                    { label: 'Intel Core i5', path: '/collections/laptop/core-i5' },
                    { label: 'Intel Core i7', path: '/collections/laptop/core-i7' },
                    { label: 'AMD Ryzen ', path: '/collections/laptop/amd-ryzen' },
                ],
            },
            {
                label: 'Nhu cầu sử dụng',
                path: '/collections/laptop',
                children: [
                    { label: 'Đồ họa - Studio', path: '/collections/laptop/do-hoa' },
                    { label: 'Học sinh - sinh viên', path: '/collections/laptop/hoc-sinh-sinh-vien' },
                    { label: 'Mỏng nhẹ cao cấp', path: '/collections/laptop/mong-nhe-cao-cap' },
                ],
            },
            {
                label: 'Linh phụ kiện laptop',
                path: '/collections/linh-kien-phu-kien-laptop',
                children: [
                    { label: 'RAM laptop', path: '/collections/laptop/ram-laptop' },
                    { label: 'SSD laptop', path: '/collections/laptop/ssd-laptop' },
                    { label: 'Ổ cứng di động', path: '/collections/laptop/o-cung-di-dong' },
                ],
            },
        ],
    },
    {
        icon: <LapTopGamingIcon />,
        label: 'Laptop Gaming',
    },
    {
        icon: <PCGVNIcon />,
        label: 'PC GVN',
    },
    {
        icon: <PCGVNIcon />,
        label: 'Main, CPU, VGA',
    },
    {
        icon: <PCGVNIcon />,
        label: 'Case, Nguồn, Tản',
    },
    {
        icon: <RAMIcon />,
        label: 'Ổ cứng, RAM, Thẻ nhớ',
    },
    {
        icon: <LoaIcon />,
        label: 'Loa, Micro, Webcam',
    },
    {
        icon: <ScreenIcon />,
        label: 'Màn hình',
    },
    {
        icon: <KeyBoardIcon />,
        label: 'Bàn phím',
    },
    {
        icon: <MouseIcon />,
        label: 'Chuột + Lót chuột',
    },
    {
        icon: <HeadPhoneIcon />,
        label: 'Tai nghe',
    },
    {
        icon: <CharIcon />,
        label: 'Ghế - Bàn',
    },
    {
        icon: <PrintIcon />,
        label: 'Phần mềm, mạng',
    },
    {
        icon: <ConsoleIcon />,
        label: 'Handheld, Console',
    },
    {
        icon: <ConsoleIcon />,
        label: 'Phụ kiện (Hub, sạc, cáp...)',
    },
    {
        icon: <BoxIcon />,
        label: 'Dịch vụ và thông tin khác',
    },
];

function CFNav() {
    return (
        <div className={cx('CFNav')}>
            <div className={cx('CFNav-wrap')}>
                <ul className={cx('CFNav-list')}>
                    {listNavigation.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CFNav;
