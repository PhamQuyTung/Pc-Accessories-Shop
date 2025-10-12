import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import classNames from 'classnames/bind';
import styles from './AdminPromotionGift.module.scss';

const cx = classNames.bind(styles);

function AdminPromotionGift() {
    const [promotions, setPromotions] = useState([]);
    const [newPromo, setNewPromo] = useState({
        title: '',
        description: '',
        discountType: 'percent', // percent | amount
        discountValue: 0,
        conditionProduct: '', // ID sản phẩm chính
        relatedProduct: '', // ID sản phẩm mua kèm
        link: '',
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await axiosClient.get('/promotion-gifts');
            setPromotions(res.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
        }
    };

    const handleAddPromotion = async () => {
        try {
            await axiosClient.post('/promotion-gifts', newPromo);
            setNewPromo({
                title: '',
                description: '',
                discountType: 'percent',
                discountValue: 0,
                conditionProduct: '',
                relatedProduct: '',
                link: '',
            });
            fetchPromotions();
        } catch (err) {
            console.error('Lỗi khi thêm khuyến mãi:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
            await axiosClient.delete(`/promotion-gifts/${id}`);
            fetchPromotions();
        }
    };

    return (
        <div className={cx('wrap')}>
            <h2>🎁 Quản lý khuyến mãi quà tặng</h2>

            <div className={cx('form')}>
                <input
                    type="text"
                    placeholder="Tiêu đề khuyến mãi"
                    value={newPromo.title}
                    onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                />
                <textarea
                    placeholder="Mô tả chi tiết"
                    value={newPromo.description}
                    onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                />
                <select
                    value={newPromo.discountType}
                    onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                >
                    <option value="percent">Giảm theo %</option>
                    <option value="amount">Giảm theo số tiền</option>
                </select>
                <input
                    type="number"
                    placeholder="Giá trị giảm"
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="ID sản phẩm chính"
                    value={newPromo.conditionProduct}
                    onChange={(e) => setNewPromo({ ...newPromo, conditionProduct: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="ID sản phẩm mua kèm"
                    value={newPromo.relatedProduct}
                    onChange={(e) => setNewPromo({ ...newPromo, relatedProduct: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Link xem thêm (tuỳ chọn)"
                    value={newPromo.link}
                    onChange={(e) => setNewPromo({ ...newPromo, link: e.target.value })}
                />
                <button onClick={handleAddPromotion}>➕ Thêm khuyến mãi</button>
            </div>

            <h3>Danh sách khuyến mãi</h3>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Tiêu đề</th>
                        <th>Loại</th>
                        <th>Giá trị</th>
                        <th>Mô tả</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((promo) => (
                        <tr key={promo._id}>
                            <td>{promo.title}</td>
                            <td>{promo.discountType === 'percent' ? '%' : '₫'}</td>
                            <td>
                                {promo.discountType === 'percent'
                                    ? `${promo.discountValue}%`
                                    : `${promo.discountValue.toLocaleString('vi-VN')}₫`}
                            </td>
                            <td>{promo.description}</td>
                            <td>
                                <button onClick={() => handleDelete(promo._id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPromotionGift;
