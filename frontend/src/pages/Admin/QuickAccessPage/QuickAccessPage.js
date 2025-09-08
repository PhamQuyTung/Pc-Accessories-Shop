import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, PlusSquare, Image, Pin, Settings, Palette, Plug } from 'lucide-react';
import styles from './QuickAccessPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const quickLinks = [
    { title: 'Tất cả trang', icon: <FileText size={32} />, to: '/admin/pages' },
    { title: 'Trang mới', icon: <PlusSquare size={32} />, to: '/admin/pages/create' },
    { title: 'Tất cả bài viết', icon: <Pin size={32} />, to: '/admin/posts' },
    { title: 'Bài viết mới', icon: <PlusSquare size={32} />, to: '/admin/posts/create' },
    { title: 'Upload Media', icon: <Image size={32} />, to: '/admin/media/upload' },
    { title: 'Cài mới Plugin', icon: <Plug size={32} />, to: '/admin/plugins' },
    { title: 'Cài mới Theme', icon: <Palette size={32} />, to: '/admin/themes' },
    { title: 'Cài đặt', icon: <Settings size={32} />, to: '/admin/settings' },
];

const QuickAccessPage = () => {
    return (
        <div className={cx('quickAccessPage')}>
            <h1 className={cx('pageTitle')}>Truy cập nhanh</h1>
            <div className={cx('grid')}>
                {quickLinks.map((link, index) => (
                    <NavLink key={index} to={link.to} className={cx('card')}>
                        <div className={cx('icon')}>{link.icon}</div>
                        <span className={cx('title')}>{link.title}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default QuickAccessPage;
