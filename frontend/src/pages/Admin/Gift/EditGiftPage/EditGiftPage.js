import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditGiftPage.module.scss';
import classNames from 'classnames/bind';
import ProductSelectModal from '~/components/ProductSelectModal/ProductSelectModal';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

export default function EditGiftPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [giftTitle, setGiftTitle] = useState('');
    const [giftProducts, setGiftProducts] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // 👉 fetch gift theo id
    useEffect(() => {
        const fetchGift = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/gifts/${id}`);
                const gift = res.data;
                setGiftTitle(gift.title); // đồng bộ với CreateGiftPage
                setGiftProducts(gift.products || []);
            } catch (err) {
                console.error('Lỗi fetch gift:', err);
                alert('Không tải được dữ liệu quà');
                navigate('/admin/gifts');
            } finally {
                setLoading(false);
            }
        };
        fetchGift();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!giftTitle) {
            return alert('Vui lòng nhập tên quà!');
        }
        if (giftProducts.length === 0) {
            return alert('Vui lòng chọn ít nhất 1 sản phẩm!');
        }

        const updatedGift = {
            title: giftTitle,
            products: giftProducts,
        };

        try {
            setLoading(true);
            await axiosClient.put(`/gifts/${id}`, updatedGift);
            alert('Cập nhật quà thành công 🎉');
            navigate('/admin/gifts');
        } catch (err) {
            console.error('Lỗi cập nhật gift:', err);
            alert('Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('container')}>
            <main className={cx('main')}>
                <div className={cx('headerRow')}>
                    <h1 className={cx('pageTitle')}>✏️ Sửa quà tặng</h1>
                    <button className={cx('btn', 'btnBack')} onClick={() => navigate('/admin/gifts')}>
                        ⬅ Quay lại
                    </button>
                </div>

                <form className={cx('formCard')} onSubmit={handleUpdate}>
                    <div className={cx('formGroup')}>
                        <label>Tên chương trình tặng quà</label>
                        <input
                            type="text"
                            value={giftTitle}
                            onChange={(e) => setGiftTitle(e.target.value)}
                            className={cx('input')}
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
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={cx('formActions')}>
                        <button type="submit" className={cx('btn', 'btnPrimary')} disabled={loading}>
                            {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
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
