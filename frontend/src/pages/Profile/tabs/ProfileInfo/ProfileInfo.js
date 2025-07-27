// src/pages/Profile/tabs/ProfileInfo.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../ProfileInfo/ProfileInfo.module.scss';
import classNames from 'classnames/bind';
import EditProfileModal from '../ProfileInfo/EditProfileModal/EditProfileModal';
import { getAvatarUrl } from '~/utils/avatar';

const cx = classNames.bind(styles);

export default function ProfileInfo() {
    const { user, setUser } = useOutletContext();
    const [isModalOpen, setModalOpen] = useState(false);

    const handleUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Lưu lại để reload không mất
        setModalOpen(false);
    };

    return (
        <div className={cx('profile-info')}>
            <h2>Thông tin tài khoản</h2>
            <div className={cx('user-info')}>
                <div className={cx('avatar')}>
                    <img src={getAvatarUrl(user)} alt="avatar" />
                </div>

                <div className={cx('info')}>
                    <p>
                        <strong>Họ và tên:</strong> {user.firstName} {user.lastName}
                    </p>
                    <p>
                        <strong>Giới tính:</strong> {user.gender || 'Chưa có'}
                    </p>
                    <p>
                        <strong>Ngày sinh:</strong>{' '}
                        {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Số điện thoại:</strong> {user.phone || 'Chưa có'}
                    </p>
                </div>
            </div>

            <button className={cx('submit-btn')} onClick={() => setModalOpen(true)}>
                Chỉnh sửa thông tin
            </button>

            {isModalOpen && (
                <EditProfileModal user={user} onClose={() => setModalOpen(false)} onUpdate={handleUpdate} />
            )}
        </div>
    );
}
