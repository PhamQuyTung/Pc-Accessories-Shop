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
        discountType: 'percent',
        discountValue: 0,
        conditionProduct: '',
        relatedProduct: '',
        link: '',
    });

    const [editId, setEditId] = useState(null);

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

    const handleSubmit = async () => {
        try {
            if (editId) {
                await axiosClient.patch(`/promotion-gifts/${editId}`, newPromo);
                alert('✅ Đã cập nhật khuyến mãi thành công!');
            } else {
                await axiosClient.post('/promotion-gifts', newPromo);
                alert('✅ Đã thêm khuyến mãi mới!');
            }

            setNewPromo({
                title: '',
                description: '',
                discountType: 'percent',
                discountValue: 0,
                conditionProduct: '',
                relatedProduct: '',
                link: '',
            });
            setEditId(null);
            fetchPromotions();
        } catch (err) {
            console.error('Lỗi khi lưu khuyến mãi:', err);
            alert('⚠️ Lỗi khi lưu khuyến mãi. Vui lòng kiểm tra lại.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
            try {
                await axiosClient.delete(`/promotion-gifts/${id}`);
                fetchPromotions();
                alert('🗑️ Đã xóa khuyến mãi thành công!');
            } catch (err) {
                console.error('Lỗi khi xóa:', err);
                alert('⚠️ Xóa thất bại!');
            }
        }
    };

    const handleEdit = (promo) => {
        setNewPromo({
            title: promo.title,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            conditionProduct: promo.conditionProduct?._id || promo.conditionProduct,
            relatedProduct: promo.relatedProduct?._id || promo.relatedProduct,
            link: promo.link || '',
        });
        setEditId(promo._id);
    };

    const handleCancelEdit = () => {
        setNewPromo({
            title: '',
            description: '',
            discountType: 'percent',
            discountValue: 0,
            conditionProduct: '',
            relatedProduct: '',
            link: '',
        });
        setEditId(null);
    };

    return (
        <div className={cx('wrap')}>
            <h2 className={cx('title')}>🎁 Quản lý khuyến mãi quà tặng</h2>

            <div className={cx('card')}>
                <div className={cx('form-group')}>
                    <label>Tiêu đề khuyến mãi</label>
                    <input
                        type="text"
                        value={newPromo.title}
                        onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Mô tả chi tiết</label>
                    <textarea
                        value={newPromo.description}
                        onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                    />
                </div>

                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                        <label>Loại giảm giá</label>
                        <select
                            value={newPromo.discountType}
                            onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                        >
                            <option value="percent">Giảm theo %</option>
                            <option value="amount">Giảm theo số tiền</option>
                        </select>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Giá trị giảm</label>
                        <input
                            type="number"
                            value={newPromo.discountValue}
                            onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                        />
                    </div>
                </div>

                <div className={cx('row')}>
                    <div className={cx('form-group')}>
                        <label>ID sản phẩm chính</label>
                        <input
                            type="text"
                            value={newPromo.conditionProduct}
                            onChange={(e) => setNewPromo({ ...newPromo, conditionProduct: e.target.value })}
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>ID sản phẩm mua kèm</label>
                        <input
                            type="text"
                            value={newPromo.relatedProduct}
                            onChange={(e) => setNewPromo({ ...newPromo, relatedProduct: e.target.value })}
                        />
                    </div>
                </div>

                <div className={cx('form-group')}>
                    <label>Link xem thêm (tuỳ chọn)</label>
                    <input
                        type="text"
                        value={newPromo.link}
                        onChange={(e) => setNewPromo({ ...newPromo, link: e.target.value })}
                    />
                </div>

                <div className={cx('actions')}>
                    <button className={cx('btn', 'btn-primary')} onClick={handleSubmit}>
                        {editId ? '💾 Lưu thay đổi' : '➕ Thêm khuyến mãi'}
                    </button>
                    {editId && (
                        <button className={cx('btn', 'btn-secondary')} onClick={handleCancelEdit}>
                            ❌ Hủy
                        </button>
                    )}
                </div>
            </div>

            <div className={cx('list-card')}>
                <h3>Danh sách khuyến mãi</h3>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Mô tả</th>
                            <th>Sản phẩm chính</th>
                            <th>Sản phẩm mua kèm</th>
                            <th>Thao tác</th>
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
                                    {promo.conditionProduct?.name ||
                                        promo.conditionProduct?._id ||
                                        promo.conditionProduct ||
                                        '—'}
                                </td>
                                <td>
                                    {promo.relatedProduct?.name ||
                                        promo.relatedProduct?._id ||
                                        promo.relatedProduct ||
                                        '—'}
                                </td>

                                <td className={cx('table-actions')}>
                                    <button onClick={() => handleEdit(promo)} title="Sửa">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(promo._id)} title="Xóa">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPromotionGift;
