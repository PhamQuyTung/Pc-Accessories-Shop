import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './EditProduct.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { quillModules, quillFormats, registerQuillModules } from '~/utils/quillSetup';

import he from 'he'; // 👉 package decode HTML entity

registerQuillModules();

const cx = classNames.bind(styles);

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categorySchema, setCategorySchema] = useState([]);
    const [importing, setImporting] = useState(false);
    const [existingProducts, setExistingProducts] = useState([]);

    const [brands, setBrands] = useState([]);

    // Load categories và products để check trùng tên
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));

        axios
            .get('http://localhost:5000/api/products')
            .then((res) => {
                // console.log('Fetched products:', res.data); // 👈 kiểm tra ở đây
                setExistingProducts(res.data);
            })
            .catch(() => {});
    }, []);

    // Load brands
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/brands')
            .then((res) => setBrands(res.data))
            .catch(() => setBrands([]));
    }, []);

    // Ở useEffect khi load sản phẩm
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/edit/${id}`)
            .then((res) => {
                const product = res.data;

                // Decode nếu bị escaped
                const decodedLongDesc = he.decode(product.longDescription || '');

                setFormData({
                    ...product,
                    // Nếu backend trả populated object thì dùng _id, nếu trả id thì giữ nguyên
                    category: product.category?._id || product.category || '',
                    brand: product.brand?._id || product.brand || '',
                    shortDescription: product.shortDescription || '',
                    longDescription: decodedLongDesc || '', // 👈 đảm bảo dạng HTML thật
                });

                setImporting(product.status?.includes('đang nhập hàng') || false);
            })
            .catch(() => toast('Không tìm thấy sản phẩm!', 'error'));
    }, [id]);

    // Khi chọn category thì load schema
    useEffect(() => {
        if (formData?.category) {
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
                    newSpecs[item.key] = formData.specs?.[item.key] || '';
                });

                setFormData((prev) => ({
                    ...prev,
                    specs: newSpecs,
                }));
            });
        }
    }, [formData?.category]);

    // Xử lý thay đổi form
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
        } else if (name.startsWith('description.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                description: {
                    ...prev.description,
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

    // Thêm trường ảnh
    const handleAddImageField = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    // Xóa trường ảnh
    const handleRemoveImageField = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData || !formData.name) return;

        // Check tên trùng
        const isDuplicateName =
            Array.isArray(existingProducts) &&
            existingProducts.some(
                (p) => p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() && p._id !== id,
            );

        if (isDuplicateName) {
            toast('Tên sản phẩm đã tồn tại!', 'error');
            return;
        }

        if (formData.price < 0 || formData.discountPrice < 0 || formData.quantity < 0 || formData.rating < 0) {
            toast('Giá, khuyến mãi, số lượng và đánh giá phải là số dương!', 'error');
            return;
        }

        if (importing && Number(formData.quantity) !== 0) {
            toast('Vui lòng đặt số lượng về 0 khi chọn "Đang nhập hàng"', 'error');
            return;
        }

        let statusArr = [];
        const qty = Number(formData.quantity);

        if (importing) {
            statusArr.push('đang nhập hàng');
        } else if (qty === 0) {
            statusArr.push('hết hàng');
        } else if (qty < 5) {
            statusArr.push('sắp hết hàng');
        } else if (qty < 10) {
            statusArr.push('còn hàng');
        } else if (qty < 20) {
            statusArr.push('nhiều hàng');
        } else {
            statusArr.push('sản phẩm mới');
        }

        try {
            const payload = {
                ...formData,
                shortDescription: formData.shortDescription || '',
                longDescription: formData.longDescription || '',
                quantity: importing ? 0 : Number(formData.quantity),
                status: statusArr,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                rating: Number(formData.rating),
                importing,
            };

            await axios.put(`http://localhost:5000/api/products/${id}`, payload);
            toast('Cập nhật sản phẩm thành công!', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            toast('Lỗi khi cập nhật sản phẩm!', 'error');
        }
    };

    // Nếu chưa load xong formData thì hiển thị loading
    if (!formData) return <div>Đang tải...</div>;

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Chỉnh sửa sản phẩm</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <div className={cx('group')}>
                    <label>Tên sản phẩm</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className={cx('group')}>
                    <label>Hình ảnh sản phẩm</label>
                    {formData.images.map((img, index) => (
                        <div key={index} className={cx('image-row')}>
                            <input
                                type="text"
                                name={`image-${index}`}
                                value={img}
                                onChange={handleChange}
                                placeholder={`URL ảnh ${index + 1}`}
                                required
                            />
                            <button type="button" onClick={() => handleRemoveImageField(index)}>
                                X
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddImageField}>
                        + Thêm ảnh
                    </button>
                </div>

                <div className={cx('group')}>
                    <label>Giá gốc</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} required />
                </div>

                <div className={cx('group')}>
                    <label>Giá khuyến mãi</label>
                    <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        min={0}
                    />
                </div>

                <div className={cx('group')}>
                    <label>Mô tả ngắn</label>
                    <textarea
                        name="shortDescription"
                        value={formData.shortDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ví dụ: Màn hình 14 inch FHD IPS, 165Hz..."
                    />
                </div>

                <div className={cx('group')}>
                    <label>Mô tả chi tiết</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.longDescription || ''}
                        onChange={(content) => setFormData((prev) => ({ ...prev, longDescription: content }))}
                        modules={quillModules}
                        formats={quillFormats}
                    />
                </div>

                <div className={cx('group')}>
                    <label>Thương hiệu</label>
                    <select name="brand" value={formData.brand} onChange={handleChange} required>
                        <option value="">-- Chọn thương hiệu --</option>
                        {brands.map((b) => (
                            <option key={b._id} value={b._id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('group')}>
                    <label>Danh mục</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {categorySchema.length > 0 && (
                    <div className={cx('group')}>
                        <label>Thông số kỹ thuật</label>
                        <div className={cx('specs')}>
                            {categorySchema.map((field, idx) => (
                                <div key={idx} className={cx('spec-item')}>
                                    <label>{field.label}</label>
                                    <input
                                        name={`specs.${field.key}`}
                                        value={formData.specs[field.key] || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={cx('group')}>
                    <label>Số lượng</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min={0}
                        required
                        disabled={importing}
                    />
                </div>

                <div className={cx('group')}>
                    <label className={cx('checkbox-label')}>
                        <input
                            type="checkbox"
                            name="importing"
                            checked={importing}
                            onChange={(e) => {
                                setImporting(e.target.checked);
                                setFormData((prev) => ({
                                    ...prev,
                                    quantity: e.target.checked ? 0 : prev.quantity,
                                }));
                            }}
                        />
                        Đang nhập hàng
                    </label>
                </div>

                <button type="submit" className={cx('submit-btn')}>
                    Cập nhật sản phẩm
                </button>
            </form>
        </div>
    );
}

export default EditProduct;
