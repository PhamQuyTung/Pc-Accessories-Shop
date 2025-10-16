import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import classNames from 'classnames/bind';
import styles from './AdminPromotionGift.module.scss';
import Select from 'react-select';

const cx = classNames.bind(styles);

function AdminPromotionGift() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalList, setModalList] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [expandedList, setExpandedList] = useState([]);
    const [expandedTitle, setExpandedTitle] = useState('');

    const [isClosing, setIsClosing] = useState(false);

    const [newPromo, setNewPromo] = useState({
        title: '',
        description: '',
        discountType: 'percent',
        discountValue: 0,
        conditionProducts: [],
        relatedProducts: [],
        link: '',
    });

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
        } catch (err) {
            console.error('Lỗi khi lấy toàn bộ sản phẩm:', err);
            setProducts([]);
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
                conditionProducts: [],
                relatedProducts: [],
                link: '',
            });
            setEditId(null);
            fetchPromotions();
        } catch (err) {
            console.error('Lỗi khi lưu khuyến mãi:', err);
            alert('⚠️ Lỗi khi lưu khuyến mãi.');
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
            conditionProducts: (promo.conditionProducts || []).map((p) => p._id || p),
            relatedProducts: (promo.relatedProducts || []).map((p) => p._id || p),
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

    const productOptions = products.map((p) => ({
        value: p._id,
        label: p.name,
    }));

    const handleToggleExpand = (promoId, columnKey, list) => {
        const isExpanded = expandedRowId === promoId && expandedTitle === columnKey;

        if (isExpanded) {
            // chạy hiệu ứng ẩn trước
            setIsClosing(true);
            setTimeout(() => {
                setExpandedRowId(null);
                setExpandedTitle('');
                setExpandedList([]);
                setIsClosing(false);
            }, 200); // trùng với thời gian animation fadeOut
        } else {
            setExpandedRowId(promoId);
            setExpandedTitle(columnKey);
            setExpandedList(list.slice(3));
        }
    };

    const renderProductList = (list = [], promoId, columnKey) => {
        if (!Array.isArray(list) || list.length === 0) return '—';

        const shown = list.slice(0, 3);
        const hidden = list.length - shown.length;
        const isExpanded = expandedRowId === promoId && expandedTitle === columnKey;

        return (
            <div className={cx('product-cell')}>
                <ul className={cx('compact-list')}>
                    {shown.map((p, i) => (
                        <li key={i}>{p.name || p._id}</li>
                    ))}
                </ul>

                {hidden > 0 && (
                    <button className={cx('more')} onClick={() => handleToggleExpand(promoId, columnKey, list)}>
                        {isExpanded ? 'Ẩn bớt ▲' : `+${hidden}`}
                    </button>
                )}

                {isExpanded && (
                    <ul className={cx('dropdown-list', { closing: isClosing })}>
                        {expandedList.map((p, i) => (
                            <li key={i}>{p.name || p._id}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className={cx('wrap')}>
            <h2 className={cx('title')}>🎁 Quản lý khuyến mãi quà tặng</h2>

            {/* Form khuyến mãi */}
            <div className={cx('card')}>
                <div className={cx('form-group')}>
                    <label>Tiêu đề khuyến mãi</label>
                    <input
                        type="text"
                        value={newPromo.title}
                        onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                        placeholder="Nhập tiêu đề..."
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Mô tả chi tiết</label>
                    <textarea
                        value={newPromo.description}
                        onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                        placeholder="Mô tả khuyến mãi..."
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
                <div className={cx('table-wrapper')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Giảm</th>
                                <th>Mô tả</th>
                                <th>Sản phẩm chính</th>
                                <th>Sản phẩm mua kèm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {promotions.map((promo) => (
                                <tr key={promo._id}>
                                    <td>{promo.title}</td>
                                    <td>
                                        {promo.discountType === 'percent'
                                            ? `${promo.discountValue}%`
                                            : `${promo.discountValue.toLocaleString('vi-VN')}₫`}
                                    </td>
                                    <td>{promo.description || '—'}</td>
                                    <td>{renderProductList(promo.conditionProducts, promo._id, 'main')}</td>
                                    <td>{renderProductList(promo.relatedProducts, promo._id, 'related')}</td>
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

            {showModal && (
                <div className={cx('modal-overlay')} onClick={() => setShowModal(false)}>
                    <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                        <h4>{modalTitle}</h4>
                        <ul className={cx('modal-list')}>
                            {modalList.map((p, i) => (
                                <li key={i}>
                                    <span>{p.name || p._id}</span>
                                </li>
                            ))}
                        </ul>
                        <button className={cx('btn-close')} onClick={() => setShowModal(false)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPromotionGift;
