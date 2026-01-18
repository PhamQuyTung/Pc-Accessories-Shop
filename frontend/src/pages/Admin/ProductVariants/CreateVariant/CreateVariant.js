import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CreateVariant.module.scss';
import ReactQuill from 'react-quill-new';

import { useToast } from '~/components/ToastMessager';
import axiosClient from '~/utils/axiosClient';
import { updateProductAttributes } from '~/services/productService';
import { buildSpecOverrides } from '~/utils/buildSpecOverrides';
import SpecEditor from '~/components/SpecEditor/SpecEditor';

const cx = classNames.bind(styles);

let isUploadingNow = false;

const CreateVariant = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [fetchingAttrs, setFetchingAttrs] = useState(false);

    // Danh sách các attribute có chủng loại (có terms)
    const [availableAttributes, setAvailableAttributes] = useState([]);

    // Danh sách các attribute đã chọn cho ma trận
    const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);

    // Map attrId -> { attrId, name, terms: [...] }
    const [attributeDataMap, setAttributeDataMap] = useState({});

    // Map attrId -> selectedTermIds (các term được chọn của attr đó)
    const [selectedTermsMap, setSelectedTermsMap] = useState({});

    // Ma trận biến thể
    const [matrix, setMatrix] = useState([]);

    // ===========================================================
    // Load product default specs
    // ===========================================================
    const [productDefaultSpecs, setProductDefaultSpecs] = useState([]);

    // Khi load xong, set mặc định cho mỗi variant trong ma trận
    useEffect(() => {
        const loadProduct = async () => {
            const res = await axiosClient.get(`/products/id/${productId}`);
            setProductDefaultSpecs(res.data.specs || []);
        };
        loadProduct();
    }, [productId]);

    // ===========================================================
    // Load available attributes (có terms)
    // ===========================================================
    const loadAvailableAttributes = async () => {
        try {
            setFetchingAttrs(true);
            const res = await axiosClient.get('/attributes');
            const allAttributes = Array.isArray(res.data) ? res.data : res.data.data || [];

            // Lọc chỉ lấy attributes có type không phải 'text'
            // hoặc fetch từng attribute để lấy terms
            const attrWithTerms = await Promise.all(
                allAttributes
                    .filter((a) => a.type !== 'text') // loại text
                    .map(async (attr) => {
                        try {
                            const termsRes = await axiosClient.get(`/attribute-terms/by-attribute/${attr._id}`);
                            const terms = Array.isArray(termsRes.data) ? termsRes.data : termsRes.data.data || [];
                            return { ...attr, terms };
                        } catch {
                            return { ...attr, terms: [] };
                        }
                    }),
            );

            // Chỉ lấy attributes có ít nhất 1 term
            const filtered = attrWithTerms.filter((a) => a.terms && a.terms.length > 0);
            setAvailableAttributes(filtered);
        } catch (err) {
            toast('Không thể tải danh sách thuộc tính!', 'error');
        } finally {
            setFetchingAttrs(false);
        }
    };

    useEffect(() => {
        loadAvailableAttributes();
    }, []);

    // ===========================================================
    // Toggle attribute selection
    // ===========================================================
    const toggleAttributeSelect = (attrId) => {
        setSelectedAttributeIds((prev) => {
            const next = prev.includes(attrId) ? prev.filter((a) => a !== attrId) : [...prev, attrId];
            return next;
        });

        // Khi bỏ chọn attribute, xóa terms của nó
        if (selectedAttributeIds.includes(attrId)) {
            setSelectedTermsMap((prev) => {
                const next = { ...prev };
                delete next[attrId];
                return next;
            });
        }
    };

    // ===========================================================
    // Toggle term selection within an attribute
    // ===========================================================
    const toggleTermSelect = (attrId, termId) => {
        setSelectedTermsMap((prev) => {
            const current = prev[attrId] || [];
            const next = current.includes(termId) ? current.filter((t) => t !== termId) : [...current, termId];
            return { ...prev, [attrId]: next };
        });
    };

    // ===========================================================
    // Build attribute data map when available attributes loaded
    // ===========================================================
    useEffect(() => {
        const map = {};
        availableAttributes.forEach((attr) => {
            map[attr._id] = attr;
        });
        setAttributeDataMap(map);
    }, [availableAttributes]);

    // ===========================================================
    // Generate matrix from selected attributes & terms
    // ===========================================================
    useEffect(() => {
        if (selectedAttributeIds.length === 0) {
            setMatrix([]);
            return;
        }

        // Lấy các attribute đã chọn (ordered)
        const selectedAttrs = selectedAttributeIds
            .map((id) => attributeDataMap[id])
            .filter((a) => a && selectedTermsMap[a._id] && selectedTermsMap[a._id].length > 0);

        if (selectedAttrs.length === 0) {
            setMatrix([]);
            return;
        }

        // Build cartesian product
        const arrays = selectedAttrs.map((attr) =>
            (selectedTermsMap[attr._id] || []).map((termId) => ({
                attrId: attr._id,
                termId,
                term: attr.terms.find((t) => t._id === termId),
            })),
        );

        const cartesian = arrays.reduce((acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])), [[]]);

        const newMatrix = cartesian
            .filter((combo) => combo.length > 0) // skip empty
            .map((combo, idx) => {
                // Tạo key từ termIds
                const key = combo.map((c) => c.termId).join('-');
                // Tìm existing row nếu có
                const existing = matrix.find((m) => m.key === key);
                return (
                    existing || {
                        key,
                        attributes: combo,
                        sku: '',
                        price: '',
                        discountPrice: '',
                        quantity: '',
                        shortDescription: '', // 👈 thêm
                        longDescription: '', // 👈 thêm
                        images: [],
                        uiSpecs: structuredClone(productDefaultSpecs),
                    }
                );
            });

        setMatrix(newMatrix);
    }, [selectedAttributeIds, selectedTermsMap, attributeDataMap]);

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
    // Upload images
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
        if (matrix.length === 0) return toast('Vui lòng chọn ít nhất 1 thuộc tính!', 'error');

        // Basic validation
        for (let item of matrix) {
            if (!item.sku?.trim()) return toast('SKU không được để trống!', 'error');
            if (!item.price || Number(item.price) <= 0) return toast('Giá phải lớn hơn 0!', 'error');
        }

        setLoading(true);

        try {
            // Convert variant specs to specOverrides
            const variants = matrix.map((row) => {
                const specOverrides = buildSpecOverrides(productDefaultSpecs, row.uiSpecs);
                console.log('🧪 specOverrides', specOverrides, Object.keys(specOverrides).length);

                return {
                    attributes: row.attributes.map((a) => ({
                        attrId: a.attrId,
                        terms: [a.termId],
                    })),
                    sku: row.sku,
                    price: Number(row.price),
                    discountPrice: Number(row.discountPrice || 0),
                    quantity: Number(row.quantity || 0),
                    shortDescription: row.shortDescription || '',
                    longDescription: row.longDescription || '',
                    images: row.images,
                    specOverrides, // ⬅️ Only changed specs
                };
            });

            await axiosClient.post(`/variants/${productId}/bulk`, { variants });

            await updateProductAttributes(productId, {
                attributes: selectedAttributeIds.map((attrId) => ({ attrId })),
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
    // Render attribute label (e.g. "Màu sắc - 5 lựa chọn")
    // ===========================================================
    const getAttrLabel = (attr) => {
        const selectedCount = selectedTermsMap[attr._id]?.length || 0;
        return `${attr.name} (${selectedCount}/${attr.terms.length})`;
    };

    // ===========================================================
    // UI
    // ===========================================================
    return (
        <div className={cx('create-page')}>
            <div className={cx('header')}>
                <h2>Tạo biến thể sản phẩm (Linh hoạt)</h2>
                <Link to={`/admin/products/${productId}/variants`} className={cx('btn-back')}>
                    ← Quay lại
                </Link>
            </div>

            <form className={cx('form')} onSubmit={handleSubmit}>
                {/* Step 1: Select attributes */}
                <div className={cx('form-group')}>
                    <h3>Bước 1: Chọn thuộc tính</h3>
                    <p className={cx('hint')}>Chọn các thuộc tính có chủng loại để tạo ma trận biến thể</p>

                    {fetchingAttrs ? (
                        <p>Đang tải...</p>
                    ) : availableAttributes.length === 0 ? (
                        <p className={cx('no-attrs')}>Không có thuộc tính nào có chủng loại.</p>
                    ) : (
                        <div className={cx('attr-checkbox-list')}>
                            {availableAttributes.map((attr) => (
                                <label key={attr._id} className={cx('checkbox-item')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAttributeIds.includes(attr._id)}
                                        onChange={() => toggleAttributeSelect(attr._id)}
                                    />
                                    <span>{attr.name}</span>
                                    <span className={cx('term-count')}>({attr.terms.length} options)</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 2: Select terms for each selected attribute */}
                {selectedAttributeIds.length > 0 && (
                    <div className={cx('form-group')}>
                        <h3>Bước 2: Chọn lựa chọn cho mỗi thuộc tính</h3>

                        {selectedAttributeIds.map((attrId) => {
                            const attr = attributeDataMap[attrId];
                            if (!attr) return null;

                            return (
                                <div key={attrId} className={cx('attr-terms-section')}>
                                    <label className={cx('section-title')}>{getAttrLabel(attr)}</label>

                                    <div className={cx('terms-grid')}>
                                        {attr.terms.map((term) => (
                                            <label key={term._id} className={cx('term-checkbox')}>
                                                <input
                                                    type="checkbox"
                                                    checked={(selectedTermsMap[attrId] || []).includes(term._id)}
                                                    onChange={() => toggleTermSelect(attrId, term._id)}
                                                />
                                                <span>{term.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Step 3: Matrix table */}
                {matrix.length > 0 && (
                    <div className={cx('form-group')}>
                        <h3>Bước 3: Nhập thông tin biến thể</h3>

                        <div className={cx('matrix-wrapper')}>
                            <table className={cx('matrix-table')}>
                                <tbody>
                                    {matrix.map((v, index) => (
                                        <div key={v.key} className={cx('variant-card')}>
                                            {/* HEADER */}
                                            <div className={cx('variant-header')}>
                                                <div className={cx('variant-title')}>
                                                    {v.attributes.map((a) => (
                                                        <span key={a.termId} className={cx('variant-attr')}>
                                                            {a.term?.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    className={cx('toggle-btn')}
                                                    onClick={() => updateMatrix(index, 'collapsed', !v.collapsed)}
                                                >
                                                    {v.collapsed ? '⯈' : '⯆'}
                                                </button>
                                            </div>

                                            {!v.collapsed && (
                                                <div className={cx('variant-body')}>
                                                    {/* INPUT GRID */}
                                                    <div className={cx('grid-2')}>
                                                        <div>
                                                            <label>SKU *</label>
                                                            <input
                                                                type="text"
                                                                value={v.sku}
                                                                onChange={(e) =>
                                                                    updateMatrix(index, 'sku', e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <label>Giá *</label>
                                                            <input
                                                                type="number"
                                                                value={v.price}
                                                                onChange={(e) =>
                                                                    updateMatrix(index, 'price', e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <label>Giá KM</label>
                                                            <input
                                                                type="number"
                                                                value={v.discountPrice}
                                                                onChange={(e) =>
                                                                    updateMatrix(index, 'discountPrice', e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <label>Số lượng</label>
                                                            <input
                                                                type="number"
                                                                value={v.quantity}
                                                                onChange={(e) =>
                                                                    updateMatrix(index, 'quantity', e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* IMAGE UPLOAD */}
                                                    <div className={cx('image-section')}>
                                                        <label>Ảnh sản phẩm</label>

                                                        {/* Nút upload custom */}
                                                        <label className={cx('upload-btn')}>
                                                            + Thêm ảnh
                                                            <input
                                                                type="file"
                                                                multiple
                                                                onChange={(e) => handleUploadImages(e, index)}
                                                                hidden
                                                            />
                                                        </label>

                                                        <div className={cx('image-preview')}>
                                                            {v.images.map((img, i) => (
                                                                <div key={i} className={cx('img-box')}>
                                                                    <img src={img} alt="" />
                                                                    <button
                                                                        type="button"
                                                                        className={cx('img-remove')}
                                                                        onClick={() => {
                                                                            const newImgs = v.images.filter(
                                                                                (_, ii) => ii !== i,
                                                                            );
                                                                            updateMatrix(index, 'images', newImgs);
                                                                        }}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Nút xóa toàn bộ ảnh */}
                                                        {v.images.length > 0 && (
                                                            <button
                                                                type="button"
                                                                className={cx('btn-remove-all-img')}
                                                                onClick={() => updateMatrix(index, 'images', [])}
                                                                style={{
                                                                    marginTop: '8px',
                                                                    background: '#ff4d4f',
                                                                    color: '#fff',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                Xóa tất cả ảnh
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* SPECS EDITOR COMPONENT */}
                                                    <SpecEditor
                                                        uiSpecs={v.uiSpecs}
                                                        productSpecs={productDefaultSpecs}
                                                        setUiSpecs={(updater) => {
                                                            setMatrix((prev) => {
                                                                const clone = [...prev];
                                                                clone[index].uiSpecs =
                                                                    typeof updater === 'function'
                                                                        ? updater(clone[index].uiSpecs)
                                                                        : updater;
                                                                return clone;
                                                            });
                                                        }}
                                                    />

                                                    {/* DESCRIPTION */}
                                                    <label>Mô tả ngắn</label>
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={v.shortDescription}
                                                        onChange={(c) => updateMatrix(index, 'shortDescription', c)}
                                                    />

                                                    <label style={{ marginTop: 12 }}>Mô tả dài</label>
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={v.longDescription}
                                                        onChange={(c) => updateMatrix(index, 'longDescription', c)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={cx('actions')}>
                    <button type="submit" disabled={loading || matrix.length === 0} className={cx('btn-submit')}>
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
