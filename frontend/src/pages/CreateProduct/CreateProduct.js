import React, { useState } from 'react';
import axios from 'axios';
import styles from './CreateProduct.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function CreateProduct() {
    const [formData, setFormData] = useState({
        name: '',
        images: [''], // ← dùng mảng để chứa nhiều ảnh
        price: '',
        discountPrice: '',
        status: '',
        category: '',
        specs: {
            cpu: '',
            vga: '',
            mainboard: '',
            ram: '',
            ssd: '',
        },
        description: '',
        rating: '',
    });

    // Sử dụng useNavigate để điều hướng sau khi tạo sản phẩm
    const navigate = useNavigate();

    // Sử dụng useToast để hiển thị thông báo
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // specs.* handling
        if (name.startsWith('specs.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                specs: {
                    ...prev.specs,
                    [key]: value,
                },
            }));
        }
        // images[i] handling
        else if (name.startsWith('image-')) {
            const index = parseInt(name.split('-')[1], 10);
            const newImages = [...formData.images];
            newImages[index] = value;
            setFormData((prev) => ({
                ...prev,
                images: newImages,
            }));
        }
        // default fields
        else {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                status: formData.status.split(',').map((s) => s.trim()),
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                rating: Number(formData.rating),
            };

            const res = await axios.post('http://localhost:5000/api/products', payload);
            toast('Thêm sản phẩm thành công!', 'success');
            navigate('/admin/products'); // Điều hướng về trang quản lý sản phẩm
            console.log('Server response:', res.data);
        } catch (err) {
            console.error('Lỗi khi tạo sản phẩm:', err);
            toast('Lỗi khi tạo sản phẩm!', 'error');
        }
    };

    const handleRemoveImageField = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className={cx('wrapper')}>
            <h2>Tạo sản phẩm mới</h2>
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
                    value={formData.status}
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
                <button type="submit">Tạo sản phẩm</button>
            </form>
        </div>
    );
}

export default CreateProduct;
