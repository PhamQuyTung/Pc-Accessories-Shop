import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CreateVariant.module.scss';
import { useToast } from '~/components/ToastMessager';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const CreateVariant = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    const [matrix, setMatrix] = useState([]);

    // --------------------------------------------------
    // Load attribute terms by key
    // --------------------------------------------------
    const loadAttributeTerms = async (key) => {
        const attr = await axiosClient.get(`/attributes/key/${key}`);
        const terms = await axiosClient.get(`/attribute-terms/by-attribute/${attr.data._id}`);
        return { attrId: attr.data._id, terms: terms.data };
    };

    const fetchAttributes = async () => {
        try {
            const [colorRes, sizeRes] = await Promise.all([
                loadAttributeTerms('mau-sac'),
                loadAttributeTerms('size-ao'),
            ]);

            setColors(colorRes.terms);
            setSizes(sizeRes.terms);
        } catch (err) {
            toast('Không thể tải danh sách màu & size!', 'error');
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    // --------------------------------------------------
    // Toggle multi-select
    // --------------------------------------------------
    const toggle = (list, setter, name) => {
        setter((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
    };

    const toggleColor = (name) => toggle(selectedColors, setSelectedColors, name);
    const toggleSize = (name) => toggle(selectedSizes, setSelectedSizes, name);

    // --------------------------------------------------
    // Auto build matrix: Color × Size
    // --------------------------------------------------
    useEffect(() => {
        const result = [];

        selectedColors.forEach((color) => {
            selectedSizes.forEach((size) => {
                result.push({
                    color,
                    size,
                    sku: '',
                    price: '',
                    quantity: '',
                    image: '',
                });
            });
        });

        setMatrix(result);
    }, [selectedColors, selectedSizes]);

    // --------------------------------------------------
    // Update matrix item
    // --------------------------------------------------
    const updateMatrix = (index, field, value) => {
        setMatrix((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    // --------------------------------------------------
    // Submit bulk variants
    // --------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (matrix.length === 0) {
            toast('Vui lòng chọn màu và size!', 'error');
            return;
        }

        for (let item of matrix) {
            if (!item.sku.trim()) return toast('SKU không được để trống', 'error');
            if (!item.price || Number(item.price) <= 0) return toast('Giá phải > 0', 'error');
        }

        setLoading(true);

        try {
            // Get attribute IDs
            const colorAttr = await axiosClient.get('/attributes/key/mau-sac');
            const sizeAttr = await axiosClient.get('/attributes/key/size-ao');

            const colorAttrId = colorAttr.data._id;
            const sizeAttrId = sizeAttr.data._id;

            // Create variants bulk
            await axiosClient.post(`/variants/${productId}/bulk`, {
                variants: matrix.map((v) => {
                    const colorTerm = colors.find((c) => c.name === v.color);
                    const sizeTerm = sizes.find((s) => s.name === v.size);

                    return {
                        attributes: [
                            { attrId: colorAttrId, termId: colorTerm?._id },
                            { attrId: sizeAttrId, termId: sizeTerm?._id },
                        ],
                        sku: v.sku,
                        price: Number(v.price),
                        discountPrice: 0,
                        quantity: Number(v.quantity),
                        images: v.image ? [v.image] : [],
                    };
                }),
            });

            // --------------------------------------------------
            // Update Product Attributes (IMPORTANT)
            // --------------------------------------------------
            try {
                await axiosClient.patch(`/products/${productId}/update-attributes`, {
                    attributes: [{ attrId: colorAttrId }, { attrId: sizeAttrId }],
                });
            } catch (err) {
                console.warn('Cập nhật attribute vào product thất bại:', err);
            }

            toast('Tạo các biến thể thành công!', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            toast(err.response?.data?.message || 'Lỗi tạo biến thể!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // UI
    // ==================================================
    return (
        <div className={cx('create-page')}>
            <div className={cx('header')}>
                <h2>Tạo biến thể sản phẩm</h2>
                <Link to={`/admin/products/${productId}/variants`} className={cx('btn-back')}>
                    ← Quay lại
                </Link>
            </div>

            <form className={cx('form')} onSubmit={handleSubmit}>
                {/* COLOR */}
                <div className={cx('form-group')}>
                    <label>Màu sắc</label>
                    <div className={cx('option-group')}>
                        {colors.map((c) => (
                            <button
                                type="button"
                                key={c._id}
                                className={cx('option-btn', {
                                    active: selectedColors.includes(c.name),
                                })}
                                onClick={() => toggleColor(c.name)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SIZE */}
                <div className={cx('form-group')}>
                    <label>Size</label>
                    <div className={cx('option-group')}>
                        {sizes.map((s) => (
                            <button
                                type="button"
                                key={s._id}
                                className={cx('option-btn', {
                                    active: selectedSizes.includes(s.name),
                                })}
                                onClick={() => toggleSize(s.name)}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MATRIX */}
                {matrix.length > 0 && (
                    <div className={cx('matrix-wrapper')}>
                        <h3>Danh sách biến thể</h3>

                        <table className={cx('matrix-table')}>
                            <thead>
                                <tr>
                                    <th>Màu</th>
                                    <th>Size</th>
                                    <th>SKU *</th>
                                    <th>Giá *</th>
                                    <th>Số lượng</th>
                                    <th>Ảnh (URL)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.color}</td>
                                        <td>{item.size}</td>

                                        <td>
                                            <input
                                                type="text"
                                                value={item.sku}
                                                onChange={(e) => updateMatrix(index, 'sku', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => updateMatrix(index, 'price', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => updateMatrix(index, 'quantity', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="text"
                                                value={item.image}
                                                onChange={(e) => updateMatrix(index, 'image', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* BUTTONS */}
                <div className={cx('actions')}>
                    <button type="submit" disabled={loading} className={cx('btn-submit')}>
                        {loading ? 'Đang tạo...' : 'Tạo tất cả biến thể'}
                    </button>

                    <Link to={`/admin/products/${productId}/variants`} className={cx('btn-cancel')}>
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default CreateVariant;
