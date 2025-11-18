import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CreateVariant.module.scss';
import { useToast } from '~/components/ToastMessager';
import axiosClient from '~/utils/axiosClient';
import { updateProductAttributes } from '~/services/productService';

const cx = classNames.bind(styles);

let isUploadingNow = false; // GLOBAL FLAG chống gọi 2 lần

const CreateVariant = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [matrix, setMatrix] = useState([]);

    // ===========================================================
    // Load attribute terms
    // ===========================================================
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

    // ===========================================================
    // Select toggle
    // ===========================================================
    const toggleSelect = (list, setter, value) => {
        setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    // ===========================================================
    // Build variant matrix
    // ===========================================================
    useEffect(() => {
        setMatrix((prev) => {
            const result = [];

            selectedColors.forEach((color) => {
                selectedSizes.forEach((size) => {
                    const existing = prev.find((v) => v.color === color && v.size === size);

                    result.push(
                        existing || {
                            color,
                            size,
                            sku: '',
                            price: '',
                            quantity: '',
                            images: [], // giữ nguyên
                        },
                    );
                });
            });

            return result;
        });
    }, [selectedColors, selectedSizes]);

    // ===========================================================
    // Update matrix row
    // ===========================================================
    const updateMatrix = (index, field, value) => {
        setMatrix((prev) => {
            const clone = [...prev];
            clone[index][field] = value;
            return clone;
        });
    };

    // ===========================================================
    // Upload many images
    // ===========================================================
    const handleUploadImages = async (e, index) => {
        if (isUploadingNow) return;
        isUploadingNow = true;

        const files = Array.from(e.target.files);
        if (files.length === 0) {
            isUploadingNow = false;
            return;
        }

        const uploadedUrls = [];

        try {
            for (let file of files) {
                const fd = new FormData();
                fd.append('file', file);

                const res = await axiosClient.post('/upload', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                uploadedUrls.push(res.data.url);
            }

            setMatrix((prev) => {
                const updated = [...prev];
                updated[index].images = [...updated[index].images, ...uploadedUrls];
                return updated;
            });
        } catch (error) {
            toast('Upload ảnh thất bại!', 'error');
        } finally {
            e.target.value = '';
            isUploadingNow = false;
        }
    };

    // ===========================================================
    // Submit
    // ===========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (matrix.length === 0) return toast('Vui lòng chọn màu và size!', 'error');

        // Validation
        for (let item of matrix) {
            if (!item.sku.trim()) return toast('SKU không được để trống!', 'error');
            if (!item.price || Number(item.price) <= 0) return toast('Giá phải lớn hơn 0!', 'error');
        }

        setLoading(true);

        try {
            const colorAttr = await axiosClient.get('/attributes/key/mau-sac');
            const sizeAttr = await axiosClient.get('/attributes/key/size-ao');

            const colorAttrId = colorAttr.data._id;
            const sizeAttrId = sizeAttr.data._id;

            // Create variants
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
                        quantity: Number(v.quantity),
                        discountPrice: 0,
                        images: v.images, // MULTI
                    };
                }),
            });

            // Save product attributes
            updateProductAttributes(productId, {
                attributes: [{ attrId: colorAttrId }, { attrId: sizeAttrId }],
            });

            toast('Tạo biến thể thành công!', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            toast(err.response?.data?.message || 'Lỗi tạo biến thể!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ===========================================================
    // UI
    // ===========================================================
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
                                onClick={() => toggleSelect(selectedColors, setSelectedColors, c.name)}
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
                                onClick={() => toggleSelect(selectedSizes, setSelectedSizes, s.name)}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MATRIX TABLE */}
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
                                    <th>Ảnh</th>
                                </tr>
                            </thead>

                            <tbody>
                                {matrix.map((v, index) => (
                                    <tr key={index}>
                                        <td>{v.color}</td>
                                        <td>{v.size}</td>

                                        <td>
                                            <input
                                                type="text"
                                                value={v.sku}
                                                onChange={(e) => updateMatrix(index, 'sku', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.price}
                                                onChange={(e) => updateMatrix(index, 'price', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.quantity}
                                                onChange={(e) => updateMatrix(index, 'quantity', e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleUploadImages(e, index)}
                                            />

                                            <div className={cx('img-count')}>
                                                {v.images.length > 0 && <span>{v.images.length} ảnh đã upload</span>}
                                            </div>

                                            {/* PREVIEW */}
                                            <div className={cx('img-preview')}>
                                                {v.images.map((img, i) => (
                                                    <img key={i} src={img} alt="" />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ACTIONS */}
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
