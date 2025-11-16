import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './EditVariant.module.scss';
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

function EditVariant() {
    const { productId, variantId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // variant form state
    const [form, setForm] = useState({
        sku: '',
        price: '',
        discountPrice: '',
        quantity: '',
        image: '',
        attributes: [], // { attrId, terms: [...] }
    });

    // attributes data (color / size)
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colorAttrId, setColorAttrId] = useState(null);
    const [sizeAttrId, setSizeAttrId] = useState(null);

    // load product variants then find the one
    const fetchVariant = async () => {
        setLoading(true);
        try {
            const res = await getVariantsByProduct(productId);
            const variants = res.data.variants || [];
            const found = variants.find((v) => v._id === variantId || v._id === String(variantId));
            if (!found) {
                toast('Không tìm thấy biến thể', 'error');
                navigate(`/admin/products/${productId}/variants`);
                return;
            }

            // map variant to form
            setForm({
                sku: found.sku || '',
                price: found.price || '',
                discountPrice: found.discountPrice || '',
                quantity: found.quantity || 0,
                image: found.image || found.images?.[0] || '',
                attributes: found.attributes || [],
            });
        } catch (err) {
            console.error(err);
            toast('Lỗi khi tải dữ liệu biến thể', 'error');
        } finally {
            setLoading(false);
        }
    };

    // load attributes (màu, size)
    const fetchAttributes = async () => {
        try {
            const colorAttrRes = await getAttributeByKey('mau-sac');
            const sizeAttrRes = await getAttributeByKey('size-ao');

            const colorId = colorAttrRes.data._id;
            const sizeId = sizeAttrRes.data._id;

            setColorAttrId(colorId);
            setSizeAttrId(sizeId);

            const [colorTermsRes, sizeTermsRes] = await Promise.all([
                getAttributeTerms(colorId),
                getAttributeTerms(sizeId),
            ]);

            setColors(colorTermsRes.data || []);
            setSizes(sizeTermsRes.data || []);
        } catch (err) {
            console.warn('Lỗi tải attribute terms', err);
        }
    };

    useEffect(() => {
        fetchAttributes();
        fetchVariant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, variantId]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // helper to read selected term id for attr
    const getSelectedTermId = (attrId) => {
        const attr = form.attributes.find((a) => String(a.attrId) === String(attrId));
        return attr?.terms?.[0] || null;
    };

    const setSelectedTerm = (attrId, termId) => {
        setForm((prev) => {
            const attributes = [...(prev.attributes || [])];
            const idx = attributes.findIndex((a) => String(a.attrId) === String(attrId));
            if (idx >= 0) {
                attributes[idx] = { ...attributes[idx], terms: [termId] };
            } else {
                attributes.push({ attrId, terms: [termId] });
            }
            return { ...prev, attributes };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // validation
        if (!form.sku.trim()) return toast('SKU không được để trống', 'error');
        if (!form.price || Number(form.price) <= 0) return toast('Giá phải > 0', 'error');

        setSaving(true);
        try {
            // prepare payload — match back-end expected shape
            const payload = {
                sku: form.sku,
                price: Number(form.price),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
                quantity: Number(form.quantity),
                image: form.image || '',
                attributes: form.attributes.map((a) => ({
                    attrId: a.attrId,
                    terms: a.terms,
                })),
            };

            await updateVariant(variantId, payload);
            toast('Cập nhật biến thể thành công', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            console.error(err);
            toast(err.response?.data?.message || 'Lỗi khi cập nhật', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá biến thể này?')) return;
        try {
            await deleteVariant(variantId);
            toast('Xoá biến thể thành công', 'success');
            navigate(`/admin/products/${productId}/variants`);
        } catch (err) {
            console.error(err);
            toast('Xoá thất bại', 'error');
        }
    };

    // preview image url
    const imagePreview = form.image ? form.image : null;

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
                                value={form.quantity || 0}
                                onChange={(e) => updateField('quantity', e.target.value)}
                            />
                        </div>

                        <div className={cx('card')}>
                            <label>Ảnh (URL)</label>
                            <input
                                value={form.image}
                                onChange={(e) => updateField('image', e.target.value)}
                                placeholder="https://..."
                            />
                            {imagePreview && (
                                <div className={cx('image-preview')}>
                                    <img src={imagePreview} alt="preview" />
                                </div>
                            )}

                            <hr />

                            {/* Attributes selects */}
                            <div className={cx('attr-group')}>
                                <label>Màu</label>
                                <select
                                    value={getSelectedTermId(colorAttrId) || ''}
                                    onChange={(e) => setSelectedTerm(colorAttrId, e.target.value)}
                                >
                                    <option value="">— Chọn màu —</option>
                                    {colors.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={cx('attr-group')}>
                                <label>Size</label>
                                <select
                                    value={getSelectedTermId(sizeAttrId) || ''}
                                    onChange={(e) => setSelectedTerm(sizeAttrId, e.target.value)}
                                >
                                    <option value="">— Chọn size —</option>
                                    {sizes.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
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
