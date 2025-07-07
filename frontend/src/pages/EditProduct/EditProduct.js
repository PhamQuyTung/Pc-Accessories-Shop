import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './EditProduct.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

function EditProduct() {
    const toast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [importing, setImporting] = useState(false);

    // Lấy danh sách category
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    // Lấy dữ liệu sản phẩm
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/edit/${id}`)
            .then((res) => {
                setFormData(res.data);
                setImporting(res.data.status?.includes('đang nhập hàng') || false);
            })
            .catch(() => toast('Không tìm thấy sản phẩm!', 'error'));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('specs.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                specs: {
                    ...prev.specs,
                    [key]: value,
                },
            }));
        } else if (name.startsWith('image-')) {
            const index = parseInt(name.split('-')[1], 10);
            const newImages = [...formData.images];
            newImages[index] = value;
            setFormData((prev) => ({
                ...prev,
                images: newImages,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAddImageField = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    const handleRemoveImageField = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Kiểm tra số âm ---
        if (formData.price < 0 || formData.discountPrice < 0 || formData.quantity < 0 || formData.rating < 0) {
            toast('Giá, khuyến mãi, số lượng và đánh giá phải là số dương!', 'error');
            return;
        }

        if (importing && Number(formData.quantity) !== 0) {
            toast('Vui lòng đặt số lượng về 0 khi chọn "Đang nhập hàng"', 'error');
            return;
        }

        // Sinh status tự động
        let statusArr = [];
        const qty = Number(formData.quantity);

        if (importing) {
            statusArr.push('đang nhập hàng');
        } else if (qty === 0) {
            statusArr.push('hết hàng');
        } else if (qty > 0 && qty < 15) {
            statusArr.push('sắp hết hàng');
        } else if (qty >= 15 && qty < 50) {
            statusArr.push('còn hàng');
        } else if (qty >= 50 && qty < 100) {
            statusArr.push('nhiều hàng');
        } else if (qty >= 100) {
            statusArr.push('sản phẩm mới');
        }

        try {
            const payload = {
                ...formData,
                quantity: importing ? 0 : Number(formData.quantity),
                status: statusArr,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                rating: Number(formData.rating),
                importing: importing,
            };
            await axios.put(`http://localhost:5000/api/products/${id}`, payload);
            toast('Cập nhật sản phẩm thành công!', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            toast('Lỗi khi cập nhật sản phẩm!', 'error');
        }
    };

    if (!formData) return <div>Đang tải...</div>;

    return (
        <div className={cx('wrapper')}>
            <h2>Chỉnh sửa sản phẩm</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <input
                    type="text"
                    name="name"
                    placeholder="Tên sản phẩm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* Multiple Image Inputs */}
                {formData.images.map((img, index) => (
                    <div key={index} className={cx('image-input')}>
                        <input
                            type="text"
                            name={`image-${index}`}
                            placeholder={`URL hình ảnh ${index + 1}`}
                            value={img}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImageField(index)}
                            className={cx('remove-btn')}
                        >
                            X
                        </button>
                    </div>
                ))}

                <button type="button" onClick={handleAddImageField}>
                    + Thêm ảnh
                </button>

                <input
                    type="number"
                    name="price"
                    placeholder="Giá gốc"
                    value={formData.price}
                    onChange={handleChange}
                    min={0}
                    required
                />

                <input
                    type="number"
                    name="discountPrice"
                    placeholder="Giá khuyến mãi"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min={0}
                />

                <input
                    type="text"
                    name="specs.cpu"
                    placeholder="CPU"
                    value={formData.specs.cpu}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.vga"
                    placeholder="VGA"
                    value={formData.specs.vga}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.mainboard"
                    placeholder="Mainboard"
                    value={formData.specs.mainboard}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.ram"
                    placeholder="RAM"
                    value={formData.specs.ram}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.ssd"
                    placeholder="SSD"
                    value={formData.specs.ssd}
                    onChange={handleChange}
                />
                <textarea
                    name="description"
                    placeholder="Mô tả sản phẩm"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                />
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="quantity"
                    placeholder="Số lượng sản phẩm"
                    value={formData.quantity}
                    onChange={handleChange}
                    min={0}
                    required
                />
                <label
                    style={{
                        gap: '5px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        fontSize: '14px',
                    }}
                >
                    <input
                        type="checkbox"
                        name="importing"
                        checked={importing}
                        onChange={(e) => setImporting(e.target.checked)}
                    />
                    Đang nhập hàng (Nếu chọn thì số lượng phải được đặt về 0)
                </label>
                <button type="submit">Cập nhật sản phẩm</button>
            </form>
        </div>
    );
}

export default EditProduct;
