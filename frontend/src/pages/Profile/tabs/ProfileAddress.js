// src/pages/Profile/tabs/ProfileAddress.jsx
import React, { useState } from 'react';
import styles from '../Profile.module.scss';
import classNames from 'classnames/bind';
import AddressModal from '../AddressModal/AddressModal';
const cx = classNames.bind(styles);

export default function ProfileAddress() {
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        city: '',
        district: '',
        ward: '',
        detail: '',
        type: 'home',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressForm({ ...addressForm, [name]: value });
    };

    const handleSubmitAddress = (e) => {
        e.preventDefault();
        setShowAddressModal(false);
        setAddressForm({
            name: '',
            phone: '',
            city: '',
            district: '',
            ward: '',
            detail: '',
            type: 'home',
        });
    };

    return (
        <>
            <div className={cx('address-header')}>
                <h2>Sổ địa chỉ</h2>
                <button className={cx('submit-btn')} onClick={() => setShowAddressModal(true)}>
                    + Thêm địa chỉ mới
                </button>
            </div>

            <div className={cx('address-list')}>
                <div className={cx('address-item')}>
                    <strong>Nhà riêng:</strong> 123 Đường ABC, Quận 1, TP.HCM
                    <br />
                    <span>Số điện thoại: 0123456789</span>
                </div>
                <div className={cx('address-item')}>
                    <strong>Công ty:</strong> 456 Đường XYZ, Quận 3, TP.HCM
                    <br />
                    <span>Số điện thoại: 0987654321</span>
                </div>
            </div>

            {showAddressModal && (
                <AddressModal
                    show={showAddressModal}
                    onClose={() => setShowAddressModal(false)}
                    onSubmit={handleSubmitAddress}
                    addressForm={addressForm}
                    handleChange={handleChange}
                    cx={cx}
                />
            )}
        </>
    );
}
