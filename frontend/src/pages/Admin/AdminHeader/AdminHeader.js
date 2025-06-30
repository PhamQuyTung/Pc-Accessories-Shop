import React from 'react';
import styles from './AdminHeader.module.scss';
import classNames from 'classnames/bind';
import { FaBell, FaEnvelope, FaPowerOff, FaUserCircle, FaSearch, FaExpand, FaBars } from 'react-icons/fa';

const cx = classNames.bind(styles);

const AdminHeader = ({ admin = { name: 'Admin', role: 'Quản trị viên', avatar: '' }, onSidebarToggle }) => {
    return (
        <div className={cx('header')}>
            <div className={cx('profile')}>
                {admin.avatar ? (
                    <img src={admin.avatar} alt="avatar" className={cx('avatar')} />
                ) : (
                    <FaUserCircle className={cx('avatar-icon')} />
                )}
                <div className={cx('info')}>
                    <span className={cx('name')}>{admin.name}</span>
                    <span className={cx('role')}>{admin.role}</span>
                </div>
            </div>
            
            <div className={cx('search')}>
                <FaSearch className={cx('search-icon')} />
                <input type="text" placeholder="Tìm kiếm..." />
            </div>

            <div className={cx('actions')}>
                <button className={cx('icon-btn')} title="Fullscreen">
                    <FaExpand />
                </button>
                <button className={cx('icon-btn')} title="Thông báo">
                    <FaBell />
                </button>
                <button className={cx('icon-btn')} title="Tin nhắn">
                    <FaEnvelope />
                </button>
                <button className={cx('icon-btn')} title="Đăng xuất">
                    <FaPowerOff />
                </button>
            </div>

            <button className={cx('sidebar-btn')} onClick={onSidebarToggle}>
                <FaBars />
            </button>
        </div>
    );
};

export default AdminHeader;