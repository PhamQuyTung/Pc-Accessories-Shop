import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './EditProduct.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/edit/${id}`)
            .then((res) => setFormData(res.data))
            .catch(() => alert('Không tìm thấy sản phẩm!'));
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
        try {
            const payload = {
                ...formData,
                status:
                    typeof formData.status === 'string'
                        ? formData.status.split(',').map((s) => s.trim())
                        : formData.status,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                rating: Number(formData.rating),
            };
            await axios.put(`http://localhost:5000/api/products/${id}`, payload);
            alert('Cập nhật sản phẩm thành công!');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            alert('Lỗi khi cập nhật sản phẩm!');
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
                    required
                />
                <input
                    type="number"
                    name="discountPrice"
                    placeholder="Giá khuyến mãi"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="status"
                    placeholder="Trạng thái (vd: mới, quà tặng)"
                    value={Array.isArray(formData.status) ? formData.status.join(', ') : formData.status}
                    onChange={handleChange}
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
                <input
                    type="text"
                    name="category"
                    placeholder="Danh mục sản phẩm (VD: PC Gaming, Laptop,...)"
                    value={formData.category}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    step="0.1"
                    name="rating"
                    placeholder="Đánh giá (rating)"
                    value={formData.rating}
                    onChange={handleChange}
                />
                <button type="submit">Cập nhật sản phẩm</button>
            </form>
        </div>
    );
}

export default EditProduct;
