import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './EditPromotion.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager/ToastMessager';

const cx = classNames.bind(styles);
const ELIGIBLE_STATUSES = ['còn hàng', 'nhiều hàng', 'sản phẩm mới'];

export default function EditPromotion() {
    const { id } = useParams();
    const [form, setForm] = useState({
        name: '',
        percent: 10,
        type: 'once',
        once: { startAt: '', endAt: '' },
        daily: { startDate: '', endDate: '', startTime: '09:00', endTime: '18:00' },
        hideWhenEnded: true,
        assignedProducts: [],
        bannerImg: '',
        promotionCardImg: '',
    });
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();
    const showToast = useToast();

    // Lấy dữ liệu CTKM và danh sách sản phẩm đủ điều kiện
    useEffect(() => {
        (async () => {
            try {
                // Lấy sản phẩm đủ điều kiện
                const { data } = await axiosClient.get('/promotions/available-products');
                setProducts(Array.isArray(data.products) ? data.products : []);

                // Lấy thông tin CTKM
                const { data: promo } = await axiosClient.get(`/promotions/${id}`);
                setForm({
                    name: promo.name || '',
                    percent: promo.percent || 10,
                    type: promo.type || 'once',
                    once: promo.once || { startAt: '', endAt: '' },
                    daily: promo.daily || { startDate: '', endDate: '', startTime: '09:00', endTime: '18:00' },
                    hideWhenEnded: promo.hideWhenEnded ?? true,
                    assignedProducts: promo.assignedProducts || [],
                    bannerImg: promo.bannerImg || '',
                    promotionCardImg: promo.promotionCardImg || '',
                });
                setSelectedIds(
                    (promo.assignedProducts || []).map((ap) => ap.product?._id || ap.product)
                );
            } catch (err) {
                showToast('Không thể tải dữ liệu CTKM', 'error');
            }
        })();
        // eslint-disable-next-line
    }, [id]);

    const onChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        if (inputType === 'checkbox') {
            setForm((prev) => ({ ...prev, [name]: checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const onChangeOnce = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            once: { ...prev.once, [name]: value },
        }));
    };

    const onChangeDaily = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            daily: { ...prev.daily, [name]: value },
        }));
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            delete payload.assignedProducts; // Không gửi assignedProducts trực tiếp

            // PATCH thông tin CTKM
            await axiosClient.patch(`/promotions/${id}`, payload);

            // Gán lại sản phẩm
            await axiosClient.post(`/promotions/${id}/assign-products`, {
                productIds: selectedIds,
            });

            showToast('Cập nhật CTKM thành công!', 'success');
            navigate('/admin/promotions');
        } catch (err) {
            showToast('Cập nhật thất bại', 'error');
        }
    };

    return (
        <div className={cx('promotion-form')}>
            <h2>Chỉnh sửa chương trình khuyến mãi</h2>
            <form onSubmit={submit}>
                <div className={cx('form-group')}>
                    <label>Tên chương trình</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Phần trăm giảm (%)</label>
                    <input
                        name="percent"
                        type="number"
                        min={1}
                        max={90}
                        value={form.percent}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Kiểu lịch</label>
                    <select name="type" value={form.type} onChange={onChange}>
                        <option value="once">Một lần</option>
                        <option value="daily">Lặp lại hàng ngày</option>
                    </select>
                </div>
                {form.type === 'once' ? (
                    <div className={cx('form-group')}>
                        <label>Thời gian áp dụng</label>
                        <input
                            type="datetime-local"
                            name="startAt"
                            value={form.once.startAt || ''}
                            onChange={onChangeOnce}
                        />
                        <input
                            type="datetime-local"
                            name="endAt"
                            value={form.once.endAt || ''}
                            onChange={onChangeOnce}
                        />
                    </div>
                ) : (
                    <div className={cx('form-group')}>
                        <label>Ngày bắt đầu</label>
                        <input
                            type="date"
                            name="startDate"
                            value={form.daily.startDate || ''}
                            onChange={onChangeDaily}
                        />
                        <label>Ngày kết thúc</label>
                        <input
                            type="date"
                            name="endDate"
                            value={form.daily.endDate || ''}
                            onChange={onChangeDaily}
                        />
                        <label>Giờ bắt đầu</label>
                        <input
                            type="time"
                            name="startTime"
                            value={form.daily.startTime || ''}
                            onChange={onChangeDaily}
                        />
                        <label>Giờ kết thúc</label>
                        <input
                            type="time"
                            name="endTime"
                            value={form.daily.endTime || ''}
                            onChange={onChangeDaily}
                        />
                    </div>
                )}
                <div className={cx('form-group')}>
                    <label>Ẩn khi kết thúc</label>
                    <input
                        type="checkbox"
                        name="hideWhenEnded"
                        checked={form.hideWhenEnded}
                        onChange={onChange}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Banner</label>
                    <input
                        name="bannerImg"
                        value={form.bannerImg}
                        onChange={onChange}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Khung sản phẩm</label>
                    <input
                        name="promotionCardImg"
                        value={form.promotionCardImg}
                        onChange={onChange}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Sản phẩm đã áp dụng</label>
                    <div className={cx('applied-products-list')}>
                        {products.filter(p => selectedIds.includes(p._id)).length === 0 && (
                            <div className={cx('empty')}>Chưa có sản phẩm nào được áp dụng</div>
                        )}
                        {products.filter(p => selectedIds.includes(p._id)).map((p) => (
                            <div key={p._id} className={cx('applied-product-card')}>
                                <img
                                    src={p.images?.[0] || '/default-product.jpg'}
                                    alt={p.name}
                                    className={cx('product-thumb')}
                                />
                                <div className={cx('product-meta')}>
                                    <div className={cx('product-name')}>{p.name}</div>
                                    <div className={cx('product-price')}>
                                        {p.discountPrice && p.discountPrice > 0 ? (
                                            <>
                                                <span className={cx('price-sale')}>
                                                    {p.discountPrice.toLocaleString()}₫
                                                </span>
                                                <span className={cx('price-original')}>
                                                    {p.price.toLocaleString()}₫
                                                </span>
                                            </>
                                        ) : (
                                            <span className={cx('price-sale')}>
                                                {p.price.toLocaleString()}₫
                                            </span>
                                        )}
                                    </div>
                                    <div className={cx('product-status', {
                                        'in-stock': p.quantity > 0,
                                        'out-stock': p.quantity <= 0,
                                    })}>
                                        {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={cx('btn-remove')}
                                    onClick={() => toggleSelect(p._id)}
                                >
                                    Gỡ
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={cx('form-group')}>
                    <label>Chọn/thay thế sản phẩm áp dụng</label>
                    <div className={cx('product-list-grid')}>
                        {products.map((p) => (
                            <div key={p._id} className={cx('product-card')}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(p._id)}
                                        onChange={() => toggleSelect(p._id)}
                                    />
                                    <div className={cx('product-info')}>
                                        <img
                                            src={p.images?.[0] || '/default-product.jpg'}
                                            alt={p.name}
                                            className={cx('product-thumb')}
                                        />
                                        <div className={cx('product-meta')}>
                                            <div className={cx('product-name')}>{p.name}</div>
                                            <div className={cx('product-price')}>
                                                {p.discountPrice && p.discountPrice > 0 ? (
                                                    <>
                                                        <span className={cx('price-sale')}>
                                                            {p.discountPrice.toLocaleString()}₫
                                                        </span>
                                                        <span className={cx('price-original')}>
                                                            {p.price.toLocaleString()}₫
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className={cx('price-sale')}>
                                                        {p.price.toLocaleString()}₫
                                                    </span>
                                                )}
                                            </div>
                                            <div className={cx('product-status', {
                                                'in-stock': p.quantity > 0,
                                                'out-stock': p.quantity <= 0,
                                            })}>
                                                {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className={cx('btn-submit')}>
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
}