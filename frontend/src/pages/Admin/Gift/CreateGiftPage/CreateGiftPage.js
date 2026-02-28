import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateGiftPage.module.scss';
import classNames from 'classnames/bind';
import ProductSelectModal from '~/components/ProductSelectModal/ProductSelectModal';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

export default function CreateGiftPage() {
    const navigate = useNavigate();
    const [giftTitle, setGiftTitle] = useState('');
    const [giftProducts, setGiftProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!giftTitle) {
            return alert('Vui lòng nhập tên quà!');
        }
        if (giftProducts.length === 0) {
            return alert('Vui lòng chọn ít nhất 1 sản phẩm!');
        }

        // make sure each product entry matches backend schema
        const newGift = {
            title: giftTitle,
            products: giftProducts.map((p) => ({
                productId: p.product?._id || p.productId, // handle either
                productName: p.productName,
                quantity: p.quantity,
                finalPrice: p.finalPrice,
            })),
        };

        try {
            setLoading(true);
            await axiosClient.post('/gifts', newGift);
            alert('Tạo quà thành công 🎉');
            navigate('/admin/gifts');
        } catch (err) {
            console.error('Lỗi tạo gift:', err);
            alert('Tạo quà thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('container')}>
            <main className={cx('main')}>
                <div className={cx('headerRow')}>
                    <h1 className={cx('pageTitle')}>➕ Tạo quà tặng mới</h1>
                    <button className={cx('btn', 'btnBack')} onClick={() => navigate('/admin/gifts')}>
                        ⬅ Quay lại
                    </button>
                </div>

                <form className={cx('formCard')} onSubmit={handleSubmit}>
                    <div className={cx('formGroup')}>
                        <label>Tên chương trình tặng quà</label>
                        <input
                            className={cx('input')}
                            placeholder="Nhập tên quà (VD: quà giáng sinh 2025, quà tặng khách VIP, quà sinh viên...)"
                            value={giftTitle}
                            onChange={(e) => setGiftTitle(e.target.value)}
                        />
                    </div>

                    <div className={cx('formGroup')}>
                        <label>Sản phẩm trong quà</label>
                        <button
                            type="button"
                            className={cx('btn', 'btnSelectProduct')}
                            onClick={() => setShowProductModal(true)}
                        >
                            📦 Chọn sản phẩm
                        </button>

                        {giftProducts.length > 0 && (
                            <ul className={cx('selectedProducts')}>
                                {giftProducts.map((p, idx) => (
                                    <li key={idx}>
                                        {p.productName} (SL: {p.quantity}) – {p.finalPrice.toLocaleString('vi-VN')} ₫
                                        <button
                                            type="button"
                                            className={cx('btn', 'btnDelete')}
                                            onClick={() => setGiftProducts((prev) => prev.filter((_, i) => i !== idx))}
                                        >
                                            ❌
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={cx('formActions')}>
                        <button type="submit" className={cx('btn', 'btnPrimary')} disabled={loading}>
                            {loading ? '⏳ Đang lưu...' : '✅ Lưu quà'}
                        </button>
                        <button
                            type="button"
                            className={cx('btn', 'btnCancel')}
                            onClick={() => navigate('/admin/gifts')}
                        >
                            ❌ Hủy
                        </button>
                    </div>
                </form>
            </main>

            {showProductModal && (
                <ProductSelectModal
                    onAdd={(product) => setGiftProducts((prev) => [...prev, product])}
                    onClose={() => setShowProductModal(false)}
                    currentOrderItems={giftProducts}
                />
            )}
        </div>
    );
}
