import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './EditPromotion.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);

    const pad = (n) => n.toString().padStart(2, '0');

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes())
    );
}

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
        productBannerImg: '',
        headerBgColor: '#003bb8',
        headerTextColor: '#ffee12',
    });
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();
    const showToast = useToast();

    // Khai báo thêm state lọc & phân trang
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // (nếu bạn có API danh mục thì load, tạm fake mảng rỗng)
    const [categories, setCategories] = useState([]);

    // (nếu bạn có API nhãn hiệu thì load, tạm fake mảng rỗng)
    const [brandFilter, setBrandFilter] = useState('');
    const [brands, setBrands] = useState([]);

    // Lọc sản phẩm
    const filteredProducts = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

        const matchCategory = categoryFilter
            ? typeof p.category === 'string'
                ? p.category === categoryFilter
                : p.category?._id === categoryFilter
            : true;

        const matchStatus =
            statusFilter === 'in-stock' ? p.quantity > 0 : statusFilter === 'out-stock' ? p.quantity <= 0 : true;

        const matchBrand = brandFilter
            ? typeof p.brand === 'string'
                ? p.brand === brandFilter
                : p.brand?._id === brandFilter
            : true;

        return matchSearch && matchCategory && matchBrand && matchStatus;
    });

    // Thêm hàm resetFilters reset bộ lọc & tìm kiếm
    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setBrandFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    // Tính tổng số trang
    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    // Cắt sản phẩm theo trang
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Load danh mục từ API (nếu có)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosClient.get('/categories');
                // giả sử API trả về mảng categories
                setCategories(res.data);
            } catch (error) {
                console.error('Lỗi load categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Load nhãn hiệu từ API (nếu có)
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axiosClient.get('/brands');
                setBrands(res.data);
            } catch (error) {
                console.error('Lỗi load brands:', error);
            }
        };
        fetchBrands();
    }, []);

    // Lấy dữ liệu CTKM và danh sách sản phẩm đủ điều kiện
    useEffect(() => {
        (async () => {
            try {
                // 🔥 Backend đã filter sẵn => chỉ cần lấy trực tiếp
                const { data } = await axiosClient.get('/promotions/available-products');
                setProducts(Array.isArray(data.products) ? data.products : []);

                // Lấy thông tin CTKM
                const { data: promo } = await axiosClient.get(`/promotions/${id}`);
                setForm({
                    name: promo.name || '',
                    percent: promo.percent || 10,
                    type: promo.type || 'once',
                    once: promo.once
                        ? {
                              startAt: formatDateTimeLocal(promo.once.startAt),
                              endAt: formatDateTimeLocal(promo.once.endAt),
                          }
                        : { startAt: '', endAt: '' },

                    daily: promo.daily || { startDate: '', endDate: '', startTime: '09:00', endTime: '18:00' },
                    hideWhenEnded: promo.hideWhenEnded ?? true,
                    assignedProducts: promo.assignedProducts || [],
                    bannerImg: promo.bannerImg || '',
                    promotionCardImg: promo.promotionCardImg || '',
                    productBannerImg: promo.productBannerImg || '',
                    headerBgColor: promo.headerBgColor || '#003bb8',
                    headerTextColor: promo.headerTextColor || '#ffee12',
                });
                setSelectedIds((promo.assignedProducts || []).map((ap) => ap.product?._id || ap.product));
            } catch (err) {
                showToast('Không thể tải dữ liệu CTKM', 'error');
            }
        })();
        // eslint-disable-next-line
    }, [id]);

    // Hàm load lại sản phẩm (nếu cần)
    const fetchProducts = async () => {
        const { data } = await axiosClient.get('/promotions/available-products');
        setProducts(Array.isArray(data.products) ? data.products : []);
    };

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
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
    };

    const handleRemoveProduct = async (productId) => {
        try {
            await axiosClient.delete(`/promotions/${id}/unassign-product/${productId}`);

            setForm((prev) => ({
                ...prev,
                assignedProducts: prev.assignedProducts.filter((ap) => (ap.product?._id || ap.product) !== productId),
            }));
            setSelectedIds((prev) => prev.filter((pid) => pid !== productId));

            // 🔄 Reload danh sách products
            await fetchProducts();

            showToast('Đã gỡ sản phẩm khỏi CTKM', 'success');
        } catch (err) {
            showToast('Gỡ sản phẩm thất bại', 'error');
        }
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

            // ✅ THÊM: Reload lại promotion để cập nhật assignedProducts
            const { data: updatedPromo } = await axiosClient.get(`/promotions/${id}`);
            setForm({
                name: updatedPromo.name || '',
                percent: updatedPromo.percent || 10,
                type: updatedPromo.type || 'once',
                once: updatedPromo.once || { startAt: '', endAt: '' },
                daily: updatedPromo.daily || { startDate: '', endDate: '', startTime: '09:00', endTime: '18:00' },
                hideWhenEnded: updatedPromo.hideWhenEnded ?? true,
                assignedProducts: updatedPromo.assignedProducts || [],
                bannerImg: updatedPromo.bannerImg || '',
                promotionCardImg: updatedPromo.promotionCardImg || '',
            });

            showToast('Cập nhật CTKM thành công!', 'success');
            navigate('/admin/promotions');
        } catch (err) {
            showToast('Cập nhật thất bại', 'error');
        }
    };

    const handleUpload = async (file, fieldName) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const url = res.data.url;

            setForm((prev) => ({
                ...prev,
                [fieldName]: url,
            }));
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Upload ảnh thất bại', 'error');
        }
    };

    const renderUploadBlock = (label, field, inputId) => (
        <div className={cx('form-group')}>
            <div className={cx('row')}>
                <label>{label}</label>

                <input
                    type="file"
                    accept="image/*"
                    id={inputId}
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(e.target.files[0], field)}
                />

                <div className={cx('upload-wrapper')}>
                    {form[field] ? (
                        <>
                            <img src={form[field]} alt="preview" className={cx('preview-img')} />

                            <div className={cx('upload-actions')}>
                                <button type="button" onClick={() => document.getElementById(inputId).click()}>
                                    Đổi ảnh
                                </button>

                                <button type="button" onClick={() => setForm((prev) => ({ ...prev, [field]: '' }))}>
                                    Xóa
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            className={cx('btn-upload')}
                            onClick={() => document.getElementById(inputId).click()}
                        >
                            + Tải ảnh lên
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className={cx('promotion-wrapper')}>
            <h2>Chỉnh sửa chương trình khuyến mãi</h2>

            <form onSubmit={submit} className={cx('promotion-layout')}>
                {/* ================= LEFT COLUMN ================= */}
                <div className={cx('left-column')}>
                    {/* ===== Thông tin cơ bản ===== */}
                    <div className={cx('form-group')}>
                        <label>Tên chương trình</label>
                        <input name="name" value={form.name} onChange={onChange} required />
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
                        <label>
                            <input
                                type="checkbox"
                                name="hideWhenEnded"
                                checked={form.hideWhenEnded}
                                onChange={onChange}
                            />
                            Ẩn khi kết thúc
                        </label>
                    </div>

                    {/* ===== Upload hình ảnh ===== */}

                    {/* Background sản phẩm */}
                    {renderUploadBlock('Ảnh background sản phẩm', 'productBannerImg', 'productBgUpload')}

                    {/* Banner */}
                    {renderUploadBlock('Banner', 'bannerImg', 'bannerUpload')}

                    {/* Khung sản phẩm */}
                    {renderUploadBlock('Khung sản phẩm', 'promotionCardImg', 'promotionCardUpload')}

                    {/* ===== Cấu hình Header ===== */}
                    <div className={cx('form-group')}>
                        <label className={cx('section-label')}>Cấu hình Header</label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label>Màu nền</label>
                                <input
                                    type="color"
                                    name="headerBgColor"
                                    value={form.headerBgColor}
                                    onChange={onChange}
                                    style={{ width: 60, height: 40 }}
                                />
                            </div>

                            <div>
                                <label>Màu chữ</label>
                                <input
                                    type="color"
                                    name="headerTextColor"
                                    value={form.headerTextColor}
                                    onChange={onChange}
                                    style={{ width: 60, height: 40 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div
                        className={cx('header-preview')}
                        style={{
                            backgroundColor: form.headerBgColor,
                            color: form.headerTextColor,
                        }}
                    >
                        🔥 {form.name || 'Tên chương trình khuyến mãi'}
                    </div>

                    <button type="submit" className={cx('btn-submit')}>
                        Lưu thay đổi
                    </button>
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div className={cx('right-column')}>
                    {/* ===== Danh sách đã áp dụng ===== */}
                    <div className={cx('form-group')}>
                        <label className={cx('section-label')}>
                            Sản phẩm đã áp dụng ({form.assignedProducts.length})
                        </label>

                        <div className={cx('applied-products-list')}>
                            {form.assignedProducts.length === 0 && (
                                <div className={cx('empty')}>📦 Chưa có sản phẩm nào</div>
                            )}

                            {form.assignedProducts.map((ap) => {
                                const product =
                                    typeof ap.product === 'object'
                                        ? ap.product
                                        : products.find((p) => p._id === ap.product);
                                if (!product) return null;

                                return (
                                    <div key={product._id} className={cx('applied-product-card')}>
                                        <div className={cx('product-meta')}>
                                            <div className={cx('product-name')}>{product.name}</div>
                                            <div className={cx('product-price')}>{product.price.toLocaleString()}₫</div>
                                        </div>
                                        <button
                                            type="button"
                                            className={cx('btn-remove')}
                                            onClick={() => handleRemoveProduct(product._id)}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== Table chọn sản phẩm ===== */}
                    <div className={cx('form-group')}>
                        <label className={cx('section-label')}>Chọn / thay thế sản phẩm ({selectedIds.length})</label>

                        {paginatedProducts.length === 0 ? (
                            <div className={cx('empty')}>📦 Không có sản phẩm</div>
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
                                        <tr key={p._id}>
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
                                            <td>
                                                <span className={cx('price-sale')}>{p.price.toLocaleString()}₫</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={cx('status', {
                                                        'in-stock': p.quantity > 0,
                                                        'out-stock': p.quantity <= 0,
                                                    })}
                                                >
                                                    {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            </form>
        </div>
    );
}
