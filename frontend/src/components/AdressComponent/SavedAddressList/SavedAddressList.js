import React, { useState, useEffect } from 'react';
import styles from './SavedAddressList.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

export default function SavedAddressList({ activeAddressId, onSelect, onOrder }) {
    const [selectedId, setSelectedId] = useState(activeAddressId || '');
    const [savedAddresses, setSavedAddresses] = useState([]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axiosClient.get('/addresses');
                setSavedAddresses(res.data || []);
            } catch (error) {
                console.error('Lỗi khi lấy địa chỉ:', error);
            }
        };
        fetchAddresses();
    }, []);

    const handleSelect = (id) => {
        setSelectedId(id);
        if (onSelect) onSelect(id);
    };

    return (
        <div className={cx('saved-address-list')}>
            <h3>Địa chỉ đã lưu</h3>
            {savedAddresses.length === 0 ? (
                <p>Chưa có địa chỉ nào được lưu.</p>
            ) : (
                <ul className={cx('address-list')}>
                    {savedAddresses.map((addr) => (
                        <li
                            key={addr._id}
                            className={cx('address-item', { active: selectedId === addr._id })}
                            onClick={() => handleSelect(addr._id)}
                        >
                            <div>
                                <strong>
                                    {addr.firstName} {addr.lastName}
                                </strong>
                                <p>{addr.phone}</p>
                                <p>
                                    {addr.detail}, {addr.ward}, {addr.district}, {addr.city}
                                </p>
                            </div>
                            {addr.isDefault && <span className={cx('default-badge')}>Mặc định</span>}
                        </li>
                    ))}
                </ul>
            )}

            <button className={cx('order-btn')} disabled={!selectedId} onClick={() => onOrder(selectedId)}>
                ĐẶT HÀNG NGAY
            </button>
        </div>
    );
}
