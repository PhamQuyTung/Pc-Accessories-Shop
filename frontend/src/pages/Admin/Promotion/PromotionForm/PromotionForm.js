import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionForm.module.scss';
import classNames from 'classnames/bind';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);
const ELIGIBLE_STATUSES = ['còn hàng', 'nhiều hàng', 'sản phẩm mới', 'sắp hết hàng', 'hàng rất nhiều'];

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
        headerBgColor: '#003bb8', // ✅ THÊM: màu nền header (mặc định xanh)
        headerTextColor: '#ffee12', // ✅ THÊM: màu chữ tiêu đề (mặc định vàng)
    });
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // Thêm state cho lọc và phân trang
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Thêm state để hiển thị variations
    const [expandedProducts, setExpandedProducts] = useState(new Set());

    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        (async () => {
            try {
                // Lấy sản phẩm đủ điều kiện từ API
                const { data } = await axiosClient.get('/promotions/available-products');
                let productList = Array.isArray(data.products) ? data.products : [];
                
                // ✅ Lọc sản phẩm không có giá gạch (double-check ở frontend)
                const filteredList = productList.filter((p) => {
                    // Loại sản phẩm đã có giá gạch
                    if (p.discountPrice && p.discountPrice > 0) return false;
                    // Loại sản phẩm bị khóa bởi CTKM khác
                    if (p.lockPromotionId) return false;
                    return true;
                });
                
                setProducts(filteredList);

                if (isEdit) {
                    // Lấy thông tin CTKM và sản phẩm đã gán
                    const { data: promo } = await axiosClient.get(`/promotions/${id}`);
                    setForm((prev) => ({
                        ...prev,
                        name: promo.name,
                        percent: promo.percent,
                        type: promo.type,
                        once: promo.once || { startAt: '', endAt: '' },
                        daily: promo.daily || { startDate: '', endDate: '', startTime: '09:00', endTime: '18:00' },
                        hideWhenEnded: promo.hideWhenEnded ?? true,
                        bannerImg: promo.bannerImg || prev.bannerImg,
                        promotionCardImg: promo.promotionCardImg || prev.promotionCardImg,
                        headerBgColor: promo.headerBgColor || '#003bb8', // ✅ THÊM
                        headerTextColor: promo.headerTextColor || '#ffee12', // ✅ THÊM
                    }));
                    // Gán selectedIds là các sản phẩm đã gán vào CTKM
                    setSelectedIds(promo.assignedProducts.map((pp) => pp.product?._id || pp.product));
                }
            } catch (err) {
                console.error('Error fetching products or promotion:', err);
            }
        })();
        // eslint-disable-next-line
    }, [id]);

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
        const payload = { ...form, assignedProducts: selectedIds };

        if (payload.type === 'once') delete payload.daily;
        else delete payload.once;

        // ✅ Validate trước khi call API
        if (!payload.name.trim()) {
            showToast('Vui lòng nhập tên chương trình!', 'warning');
            return;
        }

        if (!payload.percent || payload.percent < 1 || payload.percent > 90) {
            showToast('Phần trăm giảm không hợp lệ (1-90).', 'error');
            return;
        }

        if (!form.productBannerImg || form.productBannerImg.trim() === '') {
            showToast('Vui lòng chọn ảnh banner sản phẩm!', 'warning');
            return;
        }

        if (!form.bannerImg || form.bannerImg.trim() === '') {
            showToast('Vui lòng chọn ảnh cho chương trình!', 'warning');
            return;
        }

        if (payload.type === 'once') delete payload.daily;
        else delete payload.once;

        if (!payload.promotionCardImg || payload.promotionCardImg.trim() === '') {
            showToast('Vui lòng chọn ảnh viền card sản phẩm!', 'warning');
            return;
        }

        if (selectedIds.length === 0) {
            showToast('Hãy chọn ít nhất 1 sản phẩm!', 'warning');
            return;
        }

        try {
            let promo;
            if (isEdit) {
                promo = await axiosClient.patch(`/promotions/${id}`, payload);
            } else {
                promo = await axiosClient.post('/promotions', payload);
            }

            // Gán sản phẩm (dù là tạo mới hay sửa) — xử lý lỗi riêng biệt
            if (selectedIds.length > 0) {
                try {
                    await axiosClient.post(
                        `/promotions/${promo.data?._id || promo.data.id}/assign-products`,
                        { productIds: selectedIds }
                    );
                } catch (assignErr) {
                    console.warn('Assign products warning:', assignErr);
                    const assignMsg = assignErr.response?.data?.message || 'Lỗi khi gán sản phẩm';
                    // Hiện warning nhưng KHÔNG block flow
                    showToast(`CTKM tạo thành công nhưng: ${assignMsg}`, 'warning');
                }
            }

            showToast(isEdit ? 'Cập nhật CTKM thành công!' : 'Tạo CTKM thành công!', 'success');
            navigate('/admin/promotions');
        } catch (err) {
            console.error('❌ Error submit:', err);
            const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu CTKM!';
            showToast(msg, 'error');
        }
    };

    // Lọc sản phẩm theo tên (có thể thêm lọc khác nếu muốn)
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    // Phân trang
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className={cx('wrap')}>
            <h2>{isEdit ? 'Sửa CTKM' : 'Tạo CTKM'}</h2>

            <div className={cx('form')}>
                {/* Tên chương trình */}
                <div className={cx('row')}>
                    <label>Tên chương trình</label>
                    <input name="name" value={form.name} onChange={onChange} placeholder="Ví dụ: Back To School 2025" />
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
            <div style={{
                padding: '16px',
                marginTop: '16px',
                backgroundColor: form.headerBgColor,
                borderRadius: '8px',
                color: form.headerTextColor,
                fontSize: '20px',
                fontWeight: 'bold',
            }}>
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
                {paginatedProducts.length === 0 ? (
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
                            {paginatedProducts.map((p) => (
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
                                        <td>
                                            {p.variations?.length > 0 && (
                                                <button
                                                    onClick={() => toggleExpand(p._id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    {expandedProducts.has(p._id) ? '▼' : '▶'} ({p.variations.length})
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedProducts.has(p._id) && p.variations?.map((v) => (
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
