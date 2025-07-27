// src/components/EditProfileModal/EditProfileModal.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import styles from './EditProfileModal.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { getAvatarUrl } from '~/utils/avatar';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

export default function EditProfileModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || 'Nam',
        dob: user.dob ? user.dob.substring(0, 10) : '',
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || '',
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const previewUrl = useMemo(() => {
        if (avatarFile) return URL.createObjectURL(avatarFile);
        return getAvatarUrl({ avatar: formData.avatar });
    }, [avatarFile, formData.avatar]);

    useEffect(() => {
        return () => {
            if (avatarFile && previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [avatarFile, previewUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setAvatarFile(file);
    };

    const uploadAvatarIfNeeded = async () => {
        if (!avatarFile) return null;
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const { data } = await axiosClient.post('/accounts/me/avatar', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data; // user đã có avatar mới
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let latestUser = user;

            // 1) Upload avatar (nếu có)
            const uploadedUser = await uploadAvatarIfNeeded();
            console.log('Uploaded avatar response:', uploadedUser);

            let avatarUrl = latestUser.avatar;
            if (uploadedUser?.avatar) {
                avatarUrl = uploadedUser.avatar;
                setFormData((prev) => ({ ...prev, avatar: avatarUrl })); // <= cập nhật ngay trong modal
            }

            // 2) Update các field khác
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                dob: formData.dob || null,
                phone: formData.phone,
                // email: formData.email, // nếu không cho đổi email thì xóa dòng này
            };

            const res = await axiosClient.put('/accounts/update', payload);
            latestUser = { ...res.data, avatar: avatarUrl };

            onUpdate(latestUser);
            localStorage.setItem('user', JSON.stringify(latestUser)); // Lưu vào localStorage

            await Swal.fire({
                icon: 'success',
                title: 'Cập nhật thành công!',
                timer: 1500,
                showConfirmButton: false,
            });

            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Cập nhật thất bại',
                text: err?.response?.data?.message || 'Vui lòng thử lại sau.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
                <h3>Chỉnh sửa thông tin</h3>

                {/* Avatar */}
                <div className={cx('avatar-wrapper')}>
                    <img src={previewUrl} alt="Avatar" className={cx('avatar')} />
                    <button type="button" className={cx('avatar-btn')} onClick={() => fileInputRef.current.click()}>
                        Đổi ảnh
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={cx('form')}>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Họ</label>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Tên</label>
                            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Giới tính</label>
                        <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Khác</option>
                        </select>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} disabled />
                    </div>

                    <div className={cx('form-group')}>
                        <label>Ngày sinh</label>
                        <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
                    </div>

                    <div className={cx('form-group')}>
                        <label>SĐT</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className={cx('modal-actions')}>
                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button type="button" className={cx('cancel-btn')} onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
