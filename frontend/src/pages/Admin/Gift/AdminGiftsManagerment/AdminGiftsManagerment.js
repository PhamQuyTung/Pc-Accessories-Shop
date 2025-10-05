import React, { useState, useEffect } from 'react';
import styles from './AdminGiftsManagerment.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

export default function AdminGiftsManagement() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 👉 Lấy danh sách gift từ API
    const fetchGifts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/gifts');
            setGifts(res.data);
        } catch (err) {
            console.error('Lỗi khi fetch gifts:', err);
            setError('Không thể tải danh sách quà tặng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGifts();
    }, []);

    // 👉 Xóa quà bằng API
    const handleDeleteGift = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa quà này không?')) return;
        try {
            await axiosClient.delete(`/gifts/${id}`);
            setGifts((prev) => prev.filter((g) => g._id !== id));
        } catch (err) {
            console.error('Lỗi xóa gift:', err);
            alert('Xóa quà thất bại');
        }
    };

    return (
        <div className={cx('container')}>
            <main className={cx('main')}>
                <div className={cx('headerRow')}>
                    <h1 className={cx('pageTitle')}>🎁 Quản lý quà tặng</h1>
                    <button className={cx('btn', 'btnPrimary')} onClick={() => navigate('/admin/gifts/create')}>
                        ➕ Thêm quà mới
                    </button>
                </div>

                <div className={cx('card')}>
                    <h2 className={cx('cardTitle')}>Danh sách quà tặng</h2>

                    {loading && <p>⏳ Đang tải...</p>}
                    {error && <p className={cx('error')}>{error}</p>}

                    {!loading && gifts.length === 0 && <p>Chưa có quà tặng nào.</p>}

                    {!loading && gifts.length > 0 && (
                        <ul className={cx('giftList')}>
                            {gifts.map((gift, index) => (
                                <li key={gift._id} className={cx('giftItem')}>
                                    <div className={cx('giftInfo')}>
                                        <span>
                                            {index + 1}. <b>{gift.title}</b>
                                        </span>

                                        {gift.products && gift.products.length > 0 && (
                                            <ul className={cx('giftProducts')}>
                                                {gift.products.map((p, idx) => (
                                                    <li key={idx}>
                                                        • {p.productName} (SL: {p.quantity} –{' '}
                                                        {p.finalPrice.toLocaleString('vi-VN')} ₫)
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className={cx('actions')}>
                                        <button
                                            className={cx('btn', 'btnEdit')}
                                            onClick={() => navigate(`/admin/gifts/${gift._id}/edit`)}
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            className={cx('btn', 'btnDelete')}
                                            onClick={() => handleDeleteGift(gift._id)}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
