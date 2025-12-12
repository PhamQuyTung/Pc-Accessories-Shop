import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './EditVariant.module.scss';
import ReactQuill from 'react-quill-new';
import CustomToolbar from '~/components/Editor/CustomToolbar';
import { quillFormats, quillModules } from '~/utils/quillSetup';

import { useToast } from '~/components/ToastMessager';
import {
    getVariantsByProduct,
    updateVariant,
    deleteVariant,
    getAttributeByKey,
    getAttributeTerms,
} from '~/services/variantService';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

let isUploadingNow = false;

function EditVariant() {
    const { productId, variantId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dữ liệu form
    const [form, setForm] = useState({
        sku: '',
        price: '',
        discountPrice: '',
        quantity: '',
        shortDescription: '', // 👈 thêm
        longDescription: '', // 👈 thêm
        images: [], // MULTI IMAGES
        thumbnail: '',
        attributes: [],
    });

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colorAttrId, setColorAttrId] = useState(null);
    const [sizeAttrId, setSizeAttrId] = useState(null);

    const [dragIndex, setDragIndex] = useState(null);

    const [allVariants, setAllVariants] = useState([]);

    // -------------------------------------------------
    // FETCH: Variant
    // -------------------------------------------------
    const fetchVariant = async () => {
        setLoading(true);
        try {
            const res = await getVariantsByProduct(productId);
            const variants = res.data.variants || [];

            setAllVariants(variants);

            const found = variants.find((v) => v._id === variantId || v._id === String(variantId));
            if (!found) {
                toast('Không tìm thấy biến thể', 'error');
                navigate(`/admin/products/${productId}/variants`);
                return;
            }

            setForm({
                sku: found.sku || '',
                price: found.price || '',
                discountPrice: found.discountPrice || '',
                quantity: found.quantity || 0,
                shortDescription: found.shortDescription || '', // 👈 thêm
                longDescription: found.longDescription || '', // 👈 thêm
                images: found.images || [], // MULTI IMAGES
                thumbnail: found.thumbnail || found.images?.[0] || '',
                attributes: found.attributes || [],
            });
        } catch (err) {
            toast('Lỗi khi tải dữ liệu biến thể', 'error');
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------
    // FETCH: Attributes (Color / Size)
    // -------------------------------------------------
    const fetchAttributes = async () => {
        try {
            const colorAttr = await getAttributeByKey('mau-sac');
            const sizeAttr = await getAttributeByKey('size-ao');

            setColorAttrId(colorAttr.data._id);
            setSizeAttrId(sizeAttr.data._id);

            const [colorTerms, sizeTerms] = await Promise.all([
                getAttributeTerms(colorAttr.data._id),
                getAttributeTerms(sizeAttr.data._id),
            ]);

            setColors(colorTerms.data || []);
            setSizes(sizeTerms.data || []);
        } catch (err) {
            console.warn('Lỗi tải thuộc tính', err);
        }
    };

    useEffect(() => {
        fetchAttributes();
        fetchVariant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, variantId]);

    // -------------------------------------------------
    // Helpers
    // -------------------------------------------------
    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const getSelectedTermId = (attrId) => {
        const attr = form.attributes.find((a) => String(a.attrId) === String(attrId));
        return attr?.terms?.[0] || '';
    };

    const setSelectedTerm = (attrId, termId) => {
        setForm((prev) => {
            const attrs = [...prev.attributes];
            const index = attrs.findIndex((a) => String(a.attrId) === String(attrId));

            if (index >= 0) attrs[index] = { ...attrs[index], terms: [termId] };
            else attrs.push({ attrId, terms: [termId] });

            return { ...prev, attributes: attrs };
        });
    };

    // -------------------------------------------------
    // UPLOAD MULTIPLE IMAGES (Giống CreateVariant)
    // -------------------------------------------------
    const handleUploadImages = async (e) => {
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

            // Append ảnh mới vào form.images
            setForm((prev) => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls],
            }));
        } catch (err) {
            toast('Upload ảnh thất bại!', 'error');
        } finally {
            e.target.value = '';
            isUploadingNow = false;
        }
    };

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------
    const handleSave = async (e) => {
        e.preventDefault();

        if (!form.sku.trim()) return toast('SKU không được để trống', 'error');
        if (!form.price || Number(form.price) <= 0) return toast('Giá phải > 0', 'error');

        const skuExists = allVariants.some((v) => v.sku === form.sku && v._id !== variantId);
        if (skuExists) {
            toast('SKU đã tồn tại trong sản phẩm!', 'error');
            return;
        }

        setSaving(true);

        try {
            // ✅ Normalize attributes before sending
            const normalizedAttrs = (form.attributes || [])
                .filter((a) => a && a.attrId && a.terms && a.terms.length > 0)
                .map((a) => {
                    // ✅ Extract _id nếu a.attrId là object
                    const attrId =
                        typeof a.attrId === 'object' && a.attrId?._id ? String(a.attrId._id) : String(a.attrId);

                    // ✅ Extract _id từ terms (có thể là array of objects)
                    const terms = Array.isArray(a.terms)
                        ? a.terms.map((t) => {
                              return typeof t === 'object' && t?._id ? String(t._id) : String(t);
                          })
                        : [typeof a.terms === 'object' && a.terms?._id ? String(a.terms._id) : String(a.terms)];

                    return {
                        attrId,
                        terms,
                    };
                });

            console.log('📤 Sending normalized attributes:', normalizedAttrs); // DEBUG

            const payload = {
                sku: form.sku,
                price: Number(form.price),
                discountPrice: form.discountPrice && Number(form.discountPrice) > 0 ? Number(form.discountPrice) : null,
                quantity: Number(form.quantity),
                shortDescription: form.shortDescription, // 👈 thêm
                longDescription: form.longDescription, // 👈 thêm
                images: form.images,
                thumbnail: form.thumbnail || form.images[0] || '',
                attributes: normalizedAttrs,
            };

            console.log('📤 Full payload:', payload); // DEBUG

            await updateVariant(variantId, payload);

            toast('Cập nhật biến thể thành công', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            toast(err.response?.data?.message || 'Lỗi khi cập nhật', 'error');
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------
    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá biến thể này?')) return;

        try {
            await deleteVariant(variantId);
            toast('Xoá biến thể thành công', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            toast('Xoá thất bại', 'error');
        }
    };

    // -------------------------------------------------
    // REMOVE ONE IMAGE
    // -------------------------------------------------
    const handleRemoveImage = (url) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== url),
        }));
    };

    // -------------------------------------------------
    // DRAG & DROP REORDER
    // -------------------------------------------------
    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDrop = (index) => {
        if (dragIndex === null) return;

        const newImages = [...form.images];
        const draggedItem = newImages[dragIndex];

        newImages.splice(dragIndex, 1);
        newImages.splice(index, 0, draggedItem);

        setForm((prev) => ({ ...prev, images: newImages }));
        setDragIndex(null);
    };

    const handleSetThumbnail = (url) => {
        setForm((prev) => ({ ...prev, thumbnail: url }));
    };

    const handleRemoveAllImages = () => {
        if (!window.confirm('Xoá hết toàn bộ ảnh?')) return;
        setForm((prev) => ({ ...prev, images: [], thumbnail: '' }));
    };

    // -------------------------------------------------
    // UI
    // -------------------------------------------------
    return (
        <div className={cx('edit-variant-page')}>
            <div className={cx('header')}>
                <h2>Chỉnh sửa biến thể</h2>
                <div className={cx('header-actions')}>
                    <Link to={`/admin/products/${productId}/variants`} className={cx('btn-back')}>
                        ← Quay lại
                    </Link>
                    <button className={cx('btn-delete')} onClick={handleDelete} type="button">
                        Xoá
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={cx('loading')}>Đang tải...</div>
            ) : (
                <form className={cx('form')} onSubmit={handleSave}>
                    <div className={cx('grid')}>
                        {/* LEFT FORM CARD */}
                        <div className={cx('card')}>
                            <label>SKU *</label>
                            <input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />

                            <label>Giá *</label>
                            <input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => updateField('price', e.target.value)}
                            />

                            <label>Giá khuyến mãi</label>
                            <input
                                type="number"
                                min="0"
                                value={form.discountPrice || ''}
                                onChange={(e) => updateField('discountPrice', e.target.value)}
                            />

                            <label>Số lượng</label>
                            <input
                                type="number"
                                min="0"
                                value={form.quantity}
                                onChange={(e) => updateField('quantity', e.target.value)}
                            />

                            {/* DESCRIPTION CARD */}
                            <div className={cx('card2')} style={{ marginTop: '18px' }}>
                                {/* SHORT DESCRIPTION */}
                                <div className={cx('field')}>
                                    <label>Mô tả ngắn</label>
                                    <CustomToolbar id="variant-toolbar-short" />
                                    <ReactQuill
                                        theme="snow"
                                        value={form.shortDescription}
                                        onChange={(content) => updateField('shortDescription', content)}
                                        formats={quillFormats}
                                        modules={{
                                            ...quillModules,
                                            toolbar: {
                                                container: '#variant-toolbar-short',
                                                handlers: quillModules.toolbar.handlers,
                                            },
                                        }}
                                    />
                                </div>

                                {/* LONG DESCRIPTION */}
                                <div className={cx('field')} style={{ marginTop: '16px' }}>
                                    <label>Mô tả dài</label>
                                    <CustomToolbar id="variant-toolbar-long" />
                                    <ReactQuill
                                        theme="snow"
                                        value={form.longDescription}
                                        onChange={(content) => updateField('longDescription', content)}
                                        formats={quillFormats}
                                        modules={{
                                            ...quillModules,
                                            toolbar: {
                                                container: '#variant-toolbar-long',
                                                handlers: quillModules.toolbar.handlers,
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT FORM CARD */}
                        <div className={cx('card')}>
                            <label>Upload ảnh (nhiều ảnh)</label>
                            <input type="file" multiple accept="image/*" onChange={handleUploadImages} />

                            <div className={cx('img-count')}>
                                {form.images.length > 0 && <span>{form.images.length} ảnh đã upload</span>}
                            </div>

                            {/* PREVIEW */}
                            <div className={cx('image-preview-actions')}>
                                {form.images.length > 0 && (
                                    <button
                                        type="button"
                                        className={cx('btn-delete-all')}
                                        onClick={handleRemoveAllImages}
                                    >
                                        Xoá tất cả ảnh
                                    </button>
                                )}
                            </div>

                            <div className={cx('image-preview-list')}>
                                {form.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={cx(
                                            'image-preview-item',
                                            form.thumbnail === img && 'thumbnail',
                                            dragIndex === idx && 'dragging',
                                        )}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(idx)}
                                    >
                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            className={cx('remove-btn')}
                                            onClick={() => handleRemoveImage(img)}
                                        >
                                            ✕
                                        </button>

                                        {/* Thumbnail badge */}
                                        {form.thumbnail === img && (
                                            <div className={cx('thumbnail-badge')}>Thumbnail</div>
                                        )}

                                        {/* Thumbnail select */}
                                        <button
                                            type="button"
                                            className={cx('thumbnail-select')}
                                            onClick={() => handleSetThumbnail(img)}
                                        >
                                            Đặt làm thumbnail
                                        </button>

                                        <img src={img} alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={cx('actions')}>
                        <button type="submit" className={cx('btn-save')} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <Link to={`/admin/products/${productId}/variants`} className={cx('btn-cancel')}>
                            Huỷ
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

export default EditVariant;
