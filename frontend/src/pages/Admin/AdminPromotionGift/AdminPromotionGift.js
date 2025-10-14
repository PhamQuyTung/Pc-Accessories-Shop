import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import classNames from 'classnames/bind';
import styles from './AdminPromotionGift.module.scss';
import Select from 'react-select';

const cx = classNames.bind(styles);

function AdminPromotionGift() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]); // Danh sách sản phẩm để chọn
    const [editId, setEditId] = useState(null);

    const [newPromo, setNewPromo] = useState({
        title: '',
        description: '',
        discountType: 'percent',
        discountValue: 0,
        conditionProducts: [],
        relatedProducts: [],
        link: '',
    });

    // ✅ Gọi API lấy khuyến mãi & sản phẩm
    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await axiosClient.get('/promotion-gifts');
            setPromotions(res.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            let allProducts = [];
            let currentPage = 1;
            let totalPages = 1;

            do {
                const res = await axiosClient.get(`/products?page=${currentPage}`);
                const { products, totalPages: total } = res.data;
                allProducts = [...allProducts, ...(products || [])];
                totalPages = total;
                currentPage++;
            } while (currentPage <= totalPages);

            setProducts(allProducts);
            console.log(`✅ Đã tải tất cả ${allProducts.length} sản phẩm.`);
        } catch (err) {
            console.error('Lỗi khi lấy toàn bộ sản phẩm:', err);
            setProducts([]);
        }
    };

    // ✅ Thêm hoặc sửa khuyến mãi
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
                conditionProducts: [],
                relatedProducts: [],
                // link: '',
            });
            setEditId(null);
            fetchPromotions();
        } catch (err) {
            console.error('Lỗi khi lưu khuyến mãi:', err);
            alert('⚠️ Lỗi khi lưu khuyến mãi. Vui lòng kiểm tra lại.');
        }
    };

    // ✅ Xóa khuyến mãi
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

    // ✅ Sửa khuyến mãi
    const handleEdit = (promo) => {
        setNewPromo({
            title: promo.title,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            conditionProducts: Array.isArray(promo.conditionProducts)
                ? promo.conditionProducts.map((p) => p._id || p)
                : [],
            relatedProducts: Array.isArray(promo.relatedProducts)
                ? promo.relatedProducts.map((p) => p._id || p)
                : typeof promo.relatedProducts === 'string'
                  ? promo.relatedProducts.split(',').map((id) => id.trim())
                  : [],
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
            conditionProducts: [],
            relatedProducts: [],
            link: '',
        });
        setEditId(null);
    };

    // 👉 Danh sách options cho react-select
    const productOptions = products.map((p) => ({
        value: p._id,
        label: p.name,
    }));

    return (
        <div className={cx('wrap')}>
            <h2 className={cx('title')}>🎁 Quản lý khuyến mãi quà tặng</h2>

            <div className={cx('card')}>
                {/* Tiêu đề */}
                <div className={cx('form-group')}>
                    <label>Tiêu đề khuyến mãi</label>
                    <input
                        type="text"
                        value={newPromo.title}
                        onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                    />
                </div>

                {/* Mô tả */}
                <div className={cx('form-group')}>
                    <label>Mô tả chi tiết</label>
                    <textarea
                        value={newPromo.description}
                        onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                    />
                </div>

                {/* Loại giảm & giá trị */}
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

                {/* Sản phẩm chính */}
                <div className={cx('form-group')}>
                    <label>Sản phẩm chính</label>
                    <Select
                        isMulti
                        options={productOptions}
                        value={productOptions.filter((opt) => newPromo.conditionProducts.includes(opt.value))}
                        onChange={(selected) =>
                            setNewPromo({
                                ...newPromo,
                                conditionProducts: selected.map((s) => s.value),
                            })
                        }
                        placeholder="Chọn sản phẩm chính..."
                    />
                </div>

                {/* Sản phẩm mua kèm */}
                <div className={cx('form-group')}>
                    <label>Sản phẩm mua kèm</label>
                    <Select
                        isMulti
                        options={productOptions}
                        value={productOptions.filter((opt) => newPromo.relatedProducts.includes(opt.value))}
                        onChange={(selected) =>
                            setNewPromo({
                                ...newPromo,
                                relatedProducts: selected.map((s) => s.value),
                            })
                        }
                        placeholder="Chọn sản phẩm mua kèm..."
                    />
                </div>

                {/* Link thêm */}
                {/* <div className={cx('form-group')}>
                    <label>Link xem thêm (tuỳ chọn)</label>
                    <input
                        type="text"
                        value={newPromo.link}
                        onChange={(e) => setNewPromo({ ...newPromo, link: e.target.value })}
                    />
                </div> */}

                {/* Nút hành động */}
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

            {/* Danh sách khuyến mãi */}
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
                                    {promo.conditionProducts && promo.conditionProducts.length > 0
                                        ? promo.conditionProducts.map((p) => p.name || p._id).join(', ')
                                        : '—'}
                                </td>

                                <td>
                                    {promo.relatedProducts && promo.relatedProducts.length > 0
                                        ? promo.relatedProducts.map((rp) => rp.name || rp._id).join(', ')
                                        : '—'}
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
