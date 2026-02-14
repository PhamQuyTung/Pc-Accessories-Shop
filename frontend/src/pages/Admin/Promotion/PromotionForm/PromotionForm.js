import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionForm.module.scss';
import classNames from 'classnames/bind';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

const normalizeVariations = (p) =>
    Array.isArray(p.variations) ? p.variations : Array.isArray(p.variants) ? p.variants : [];

const hasDiscountPrice = (p) => {
    const value = Number(p.discountPrice);
    return !Number.isNaN(value) && value > 0;
};

const isEligibleForPromotion = (p) => {
    const variations = normalizeVariations(p);

    if (variations.length > 0) return false;
    if (hasDiscountPrice(p)) return false;
    if (Number(p.quantity) <= 0) return false;
    if (p.lockPromotionId) return false;

    return true;
};

export default function PromotionForm() {
    const { id } = useParams(); // nếu có id => edit
    const isEdit = Boolean(id);
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
        productBannerImg: '',
        bigBannerImg: '',
        headerBgColor: '#003bb8', // ✅ THÊM: màu nền header (mặc định xanh)
        headerTextColor: '#ffee12', // ✅ THÊM: màu chữ tiêu đề (mặc định vàng)
    });
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // Thêm state cho lọc và phân trang
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);

    // Thêm state để hiển thị variations
    const [expandedProducts, setExpandedProducts] = useState(new Set());

    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axiosClient.get(
                    `/promotions/available-products?page=${currentPage}&limit=${pageSize}&search=${search}`,
                );

                setProducts(Array.isArray(data.products) ? data.products : []);
                setTotalPages(data.totalPages || 1);

                if (isEdit) {
                    const { data: promo } = await axiosClient.get(`/promotions/${id}`);

                    setForm((prev) => ({
                        ...prev,
                        name: promo.name,
                        percent: promo.percent,
                        type: promo.type,
                        once: promo.once || prev.once,
                        daily: promo.daily || prev.daily,
                        hideWhenEnded: promo.hideWhenEnded ?? true,
                        bannerImg: promo.bannerImg || '',
                        promotionCardImg: promo.promotionCardImg || '',
                        productBannerImg: promo.productBannerImg || '',
                        bigBannerImg: promo.bigBannerImg || '',
                        headerBgColor: promo.headerBgColor || '#003bb8',
                        headerTextColor: promo.headerTextColor || '#ffee12',
                    }));

                    setSelectedIds(promo.assignedProducts.map((p) => p.product?._id || p.product));
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchData();
    }, [id, isEdit, currentPage, search]);

    const onChange = (e) => {
        const { name, value, type } = e.target;
        if (name.startsWith('once.') || name.startsWith('daily.')) {
            const [group, key] = name.split('.');
            setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
        } else if (type === 'checkbox') {
            setForm((prev) => ({ ...prev, [name]: e.target.checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleExpand = (productId) => {
        const newSet = new Set(expandedProducts);
        if (newSet.has(productId)) {
            newSet.delete(productId);
        } else {
            newSet.add(productId);
        }
        setExpandedProducts(newSet);
    };

    const submit = async () => {
        if (!form.name.trim()) return showToast('Vui lòng nhập tên CTKM!', 'warning');
        if (form.percent < 1 || form.percent > 90) return showToast('Giảm giá không hợp lệ (1-90)', 'error');
        if (!selectedIds.length) return showToast('Hãy chọn ít nhất 1 sản phẩm!', 'warning');

        const payload = {
            ...form,
            assignedProducts: selectedIds,
        };

        if (payload.type === 'once') delete payload.daily;
        else delete payload.once;

        try {
            const res = isEdit
                ? await axiosClient.patch(`/promotions/${id}`, payload)
                : await axiosClient.post('/promotions', payload);

            await axiosClient.post(`/promotions/${res.data._id}/assign-products`, { productIds: selectedIds });

            showToast(isEdit ? 'Cập nhật CTKM thành công!' : 'Tạo CTKM thành công!', 'success');
            navigate('/admin/promotions');
        } catch (err) {
            showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    return (
        <div className={cx('wrap')}>
            <h2>{isEdit ? 'Sửa CTKM' : 'Tạo CTKM'}</h2>

            <div className={cx('form')}>
                {/* Tên chương trình */}
                <div className={cx('row')}>
                    <label>Tên chương trình</label>
                    <input name="name" value={form.name} onChange={onChange} placeholder="Ví dụ: Back To School 2025" />
                </div>

                {/* Big Banner */}
                <div className={cx('row')}>
                    <label>Ảnh Big Banner (1320x300)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                                const res = await axiosClient.post('/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });

                                const url = res.data.url;
                                setForm((prev) => ({ ...prev, bigBannerImg: url }));
                            } catch (err) {
                                console.error('Upload Big Banner error', err);
                            }
                        }}
                    />

                    {form.bigBannerImg && (
                        <img
                            src={form.bigBannerImg}
                            alt="preview-big-banner"
                            style={{ width: '100%', maxWidth: 500, marginTop: 8, borderRadius: 8 }}
                        />
                    )}
                </div>

                {/* Ảnh background sản phẩm */}
                <div className={cx('row')}>
                    <label>Ảnh background sản phẩm</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                                const res = await axiosClient.post('/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });
                                const url = res.data.url;
                                setForm((prev) => ({ ...prev, productBannerImg: url }));
                            } catch (err) {
                                console.error('Upload error', err);
                            }
                        }}
                    />
                    {form.productBannerImg && (
                        <img
                            src={form.productBannerImg}
                            alt="preview-product-banner"
                            style={{ maxWidth: 200, marginTop: 8 }}
                        />
                    )}
                </div>

                {/* Ảnh chương trình */}
                <div className={cx('row')}>
                    <label>Ảnh small banner bên trái</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            // Upload lên server
                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                                const res = await axiosClient.post('/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });
                                const url = res.data.url; // server trả URL ảnh
                                console.log('Ảnh đã upload:', url);
                                setForm((prev) => ({ ...prev, bannerImg: url }));
                            } catch (err) {
                                console.error('Upload error', err);
                            }
                        }}
                    />
                    {form.bannerImg && (
                        <img src={form.bannerImg} alt="preview" style={{ maxWidth: 200, marginTop: 8 }} />
                    )}
                </div>

                {/* Ảnh viền Card sản phẩm */}
                <div className={cx('row')}>
                    <label>Ảnh viền card sản phẩm bên phải</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                                const res = await axiosClient.post('/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });
                                const url = res.data.url;
                                setForm((prev) => ({ ...prev, promotionCardImg: url }));
                            } catch (err) {
                                console.error('Upload error', err);
                            }
                        }}
                    />
                    {form.promotionCardImg && (
                        <img src={form.promotionCardImg} alt="preview-card" style={{ maxWidth: 200, marginTop: 8 }} />
                    )}
                </div>

                {/* Giảm giá chương trình */}
                <div className={cx('row')}>
                    <label>Giảm giá (%)</label>
                    <input type="number" name="percent" min={1} max={90} value={form.percent} onChange={onChange} />
                </div>

                {/* Kiểu lịch chương trình */}
                <div className={cx('row')}>
                    <label>Kiểu lịch</label>
                    <select name="type" value={form.type} onChange={onChange}>
                        <option value="once">Một lần</option>
                        <option value="daily">Lặp hằng ngày</option>
                    </select>
                </div>

                {/* Chình thời gian */}
                {form.type === 'once' ? (
                    <div className={cx('grid2')}>
                        <div className={cx('row')}>
                            <label>Bắt đầu</label>
                            <input
                                type="datetime-local"
                                name="once.startAt"
                                value={form.once.startAt}
                                onChange={onChange}
                            />
                        </div>
                        <div className={cx('row')}>
                            <label>Kết thúc</label>
                            <input
                                type="datetime-local"
                                name="once.endAt"
                                value={form.once.endAt}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={cx('grid2')}>
                            <div className={cx('row')}>
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    name="daily.startDate"
                                    value={form.daily.startDate}
                                    onChange={onChange}
                                />
                            </div>
                            <div className={cx('row')}>
                                <label>Ngày kết thúc (tuỳ chọn)</label>
                                <input
                                    type="date"
                                    name="daily.endDate"
                                    value={form.daily.endDate || ''}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                        <div className={cx('grid2')}>
                            <div className={cx('row')}>
                                <label>Giờ bắt đầu</label>
                                <input
                                    type="time"
                                    name="daily.startTime"
                                    value={form.daily.startTime}
                                    onChange={onChange}
                                />
                            </div>
                            <div className={cx('row')}>
                                <label>Giờ kết thúc</label>
                                <input
                                    type="time"
                                    name="daily.endTime"
                                    value={form.daily.endTime}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Tự ẩn CTKM khi kết thúc (không xoá DB) */}
                <div className={cx('rowCheck')}>
                    <input
                        type="checkbox"
                        id="hideEnded"
                        name="hideWhenEnded"
                        checked={form.hideWhenEnded}
                        onChange={onChange}
                    />
                    <label htmlFor="hideEnded">Tự ẩn CTKM khi kết thúc (không xoá DB)</label>
                </div>
            </div>

            {/* ✅ THÊM: Chỉnh màu header */}
            <div className={cx('section-title')}>Cấu hình Header</div>
            <div className={cx('grid2')}>
                <div className={cx('row')}>
                    <label>Màu nền header</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="color"
                            name="headerBgColor"
                            value={form.headerBgColor}
                            onChange={onChange}
                            style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                        />
                        <input
                            type="text"
                            value={form.headerBgColor}
                            onChange={onChange}
                            name="headerBgColor"
                            placeholder="#003bb8"
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>
                <div className={cx('row')}>
                    <label>Màu chữ tiêu đề</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="color"
                            name="headerTextColor"
                            value={form.headerTextColor}
                            onChange={onChange}
                            style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                        />
                        <input
                            type="text"
                            value={form.headerTextColor}
                            onChange={onChange}
                            name="headerTextColor"
                            placeholder="#ffee12"
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div
                style={{
                    padding: '16px',
                    marginTop: '16px',
                    backgroundColor: form.headerBgColor,
                    borderRadius: '8px',
                    color: form.headerTextColor,
                    fontSize: '20px',
                    fontWeight: 'bold',
                }}
            >
                🔥 Preview: {form.name || 'Tên CTKM'}
            </div>

            {/* Lựa chọn sản phẩm áp dụng (chỉ cho phép sản phẩm không có giá gạch) */}
            <div className={cx('products')}>
                <div className={cx('header')}>
                    <h3>Chọn sản phẩm áp dụng</h3>
                    <span>(Hiển thị tất cả sản phẩm, có tìm kiếm & phân trang)</span>
                </div>

                {/* Bộ lọc */}
                <div className={cx('filters')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Danh sách sản phẩm dạng table */}
                {products.length === 0 ? (
                    <div className={cx('empty')}>
                        <span>📦</span> Không tìm thấy sản phẩm nào
                    </div>
                ) : (
                    <table className={cx('product-table')}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Sản phẩm</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <React.Fragment key={p._id}>
                                    <tr>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p._id)}
                                                onChange={() => toggleSelect(p._id)}
                                            />
                                        </td>
                                        <td className={cx('product-name-cell')}>
                                            <img
                                                src={p.images?.[0] || '/default-product.jpg'}
                                                alt={p.name}
                                                className={cx('thumb')}
                                            />
                                            <span>{p.name}</span>
                                        </td>
                                        <td>{p.price.toLocaleString()}₫</td>
                                        <td>
                                            <span className={cx('status')}>{p.status}</span>
                                        </td>
                                    </tr>
                                    {expandedProducts.has(p._id) &&
                                        p.variations?.map((v) => (
                                            <tr key={v._id} style={{ backgroundColor: '#f5f5f5' }}>
                                                <td colSpan="2" style={{ paddingLeft: '40px' }}>
                                                    Biến thể: {v.sku}
                                                </td>
                                                <td>{v.price.toLocaleString()}₫</td>
                                                <td>Qty: {v.quantity}</td>
                                                <td></td>
                                            </tr>
                                        ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <div className={cx('footer')}>
                <button onClick={() => navigate('/admin/promotions')}>Hủy</button>
                <button className={cx('primary')} onClick={submit}>
                    {isEdit ? 'Lưu thay đổi' : 'Tạo CTKM'}
                </button>
            </div>
        </div>
    );
}
