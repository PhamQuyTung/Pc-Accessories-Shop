// src/pages/Product/CreateProduct/CreateProduct.js
import React, { useState } from 'react';
import axios from 'axios';
import styles from './CreateProduct.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function CreateProduct() {
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        price: '',
        discountPrice: '',
        status: '',
        specs: {
            cpu: '',
            vga: '',
            mainboard: '',
            ram: '',
            ssd: '',
        },
        rating: '',
    });

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
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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
            alert('Thêm sản phẩm thành công!');
            console.log('Server response:', res.data);
        } catch (err) {
            console.error('Lỗi khi tạo sản phẩm:', err);
            alert('Lỗi khi tạo sản phẩm!');
        }
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
                <input
                    type="text"
                    name="image"
                    placeholder="URL hình ảnh"
                    value={formData.image}
                    onChange={handleChange}
                    required
                />
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
