import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CreateProduct.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function CreateProduct() {
    const [formData, setFormData] = useState({
        name: '',
        images: [''],
        price: '',
        discountPrice: '',
        status: '',
        category: '',
        specs: {},
        description: '',
        rating: '',
        quantity: '',
        importing: false,
    });

    const [categories, setCategories] = useState([]);
    const [categorySchema, setCategorySchema] = useState([]);

    const [existingProducts, setExistingProducts] = useState([]);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/products')
            .then((res) => setExistingProducts(res.data))
            .catch(() => setExistingProducts([]));
    }, []);

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (formData.category) {
            axios.get(`http://localhost:5000/api/categories/${formData.category}`).then((res) => {
                const attributes = res.data.attributes || [];

                const schema = attributes.map((attr) => ({
                    label: attr.name,
                    key: attr.key,
                    type: attr.type,
                }));

                setCategorySchema(schema);

                const newSpecs = {};
                schema.forEach((item) => {
                    newSpecs[item.key] = formData.specs[item.key] || '';
                });

                setFormData((prev) => ({
                    ...prev,
                    specs: newSpecs,
                }));
            });
        } else {
            setCategorySchema([]);
            setFormData((prev) => ({
                ...prev,
                specs: {},
            }));
        }
    }, [formData.category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

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
        } else if (name === 'importing') {
            setFormData((prev) => ({
                ...prev,
                importing: checked,
                quantity: checked ? 0 : prev.quantity,
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

        // Kiểm tra trùng tên sản phẩm
        const isDuplicateName = existingProducts.some(
            (product) => product.name.trim().toLowerCase() === formData.name.trim().toLowerCase(),
        );
        if (isDuplicateName) {
            toast('Tên sản phẩm đã tồn tại!', 'error');
            return;
        }

        if (formData.importing && Number(formData.quantity) !== 0) {
            toast('Khi đã chọn đang nhập hàng, số lượng phải bằng 0', 'error');
            return;
        }

        let statusArr = [];
        const qty = Number(formData.quantity);

        if (formData.importing) {
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
                quantity: formData.importing ? 0 : Number(formData.quantity),
                status: statusArr,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
            };

            await axios.post('http://localhost:5000/api/products', payload);
            toast('Thêm sản phẩm thành công!', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi tạo sản phẩm:', err);
            toast('Lỗi khi tạo sản phẩm!', 'error');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h2>Tạo sản phẩm mới</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <label>Tên sản phẩm</label>
                <input name="name" value={formData.name} onChange={handleChange} required />

                <label>Ảnh sản phẩm</label>
                {formData.images.map((img, i) => (
                    <div key={i} className={cx('image-input')}>
                        <input
                            name={`image-${i}`}
                            value={img}
                            onChange={handleChange}
                            placeholder={`URL ảnh ${i + 1}`}
                            required
                        />
                        <button type="button" onClick={() => handleRemoveImageField(i)}>
                            X
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddImageField} className={cx('add-btn')}>
                    + Thêm ảnh
                </button>

                <div className={cx('form-row')}>
                    <div style={{ flex: 1 }}>
                        <label>Giá gốc</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Giá khuyến mãi</label>
                        <input
                            type="number"
                            name="discountPrice"
                            value={formData.discountPrice}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <label>Mô tả sản phẩm</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />

                <label>Danh mục</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <h4>Thông số kỹ thuật</h4>
                <div className={cx('specs-grid')}>
                    {categorySchema.map((field, idx) => (
                        <div key={idx}>
                            <label>{field.label || field.key}</label>
                            <input
                                name={`specs.${field.key}`}
                                value={formData.specs[field.key] || ''}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                </div>

                <div className={cx('input-group')}>
                    <label className={cx('label')}>Số lượng</label>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Nhập số lượng"
                        value={formData.quantity}
                        onChange={handleChange}
                        min={0}
                        required
                        className={cx('input')}
                    />
                </div>

                <div className={cx('checkbox-wrapper')}>
                    <input
                        type="checkbox"
                        id="importing"
                        name="importing"
                        checked={formData.importing}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                importing: e.target.checked,
                                quantity: e.target.checked ? 0 : prev.quantity,
                            }))
                        }
                    />
                    <label htmlFor="importing">Đang nhập hàng</label>
                </div>

                <button type="submit" className={cx('submit-btn')}>
                    Tạo sản phẩm
                </button>
            </form>
        </div>
    );
}

export default CreateProduct;
