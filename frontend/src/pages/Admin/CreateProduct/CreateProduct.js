import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './CreateProduct.module.scss';
import { useNavigate } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const cx = classNames.bind(styles);

export default function CreateProduct() {
    const toast = useToast();
    const navigate = useNavigate();

    // Basic form data
    const [form, setForm] = useState({
        name: '',
        description: '',
        images: [''],
        price: '',
        discountPrice: '',
        quantity: '',
        importing: false,
        brand: '',
        category: '',
        specs: {},
    });

    const [categories, setCategories] = useState([]);
    const [categorySchema, setCategorySchema] = useState([]);

    // Product type
    const [productType, setProductType] = useState('simple'); // 'simple' | 'variable'

    // Attributes & terms from backend
    const [allAttributes, setAllAttributes] = useState([]); // attributes with terms

    // Attributes selected for this product
    // { attrId, name, type, useForVariations: bool, terms: [termIds...] }
    const [productAttributes, setProductAttributes] = useState([]);

    // Map of attributeId -> full term objects (from backend)
    const [attributeTermsMap, setAttributeTermsMap] = useState({});

    // Variant combinations (auto generated) or custom list
    const [variants, setVariants] = useState([]);

    // existingProducts for duplicate name check
    const [existingProducts, setExistingProducts] = useState([]);

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    const [attributes, setAttributes] = useState([]);

    const handleSelectColor = (color) => {
        setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
    };

    const handleSelectSize = (size) => {
        setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
    };

    const fetchTermsByAttribute = async (attribute) => {
        try {
            const res = await fetch(`/api/attribute-terms/by-attribute/${attribute._id}`);
            if (!res.ok) throw new Error('Không thể lấy terms');
            return await res.json();
        } catch (err) {
            console.error('Lỗi lấy terms:', err);
            return [];
        }
    };

    // Vấn đề đang fix
    useEffect(() => {
        const fetchAttributesAndTerms = async () => {
            try {
                console.log('🚀 Bắt đầu load attributes + terms');

                // 1️⃣ Lấy danh sách attributes từ backend
                const { data: attrRes } = await axiosClient.get('/attributes');
                const attributes = Array.isArray(attrRes) ? attrRes : attrRes.data || [];

                console.log('✅ Attributes nhận về:', attributes);

                if (!attributes.length) {
                    console.warn('⚠️ Không có attributes nào từ server');
                    return;
                }

                // 2️⃣ Lấy terms cho từng attribute
                const attributesWithTerms = await Promise.all(
                    attributes.map(async (attr) => {
                        // Nếu type = text → không fetch terms
                        if (attr.type === 'text') {
                            return {
                                attrId: attr._id,
                                name: attr.name,
                                type: attr.type,
                                useForVariations: false,
                                terms: [],
                            };
                        }

                        try {
                            const url = `/attribute-terms/${attr._id}`;
                            console.log('🔹 Gọi URL:', axiosClient.defaults.baseURL + url);

                            const res = await axiosClient.get(url);
                            const terms = Array.isArray(res.data) ? res.data : res.data?.data || [];

                            return {
                                attrId: attr._id,
                                name: attr.name,
                                type: attr.type,
                                useForVariations: false,
                                terms: terms.map((t) => ({
                                    termId: t._id,
                                    name: t.name,
                                    slug: t.slug,
                                    colorCode: t.color || null,
                                })),
                            };
                        } catch (err) {
                            console.error(`❌ Lỗi lấy terms cho ${attr.name}:`, err);
                            return { ...attr, terms: [] };
                        }
                    }),
                );

                // 3️⃣ Log cảnh báo nếu cần
                attributesWithTerms.forEach((attr) => {
                    if (attr.terms.length > 0) {
                        console.log(`📦 Terms của ${attr.name}:`, attr.terms);
                    } else if (attr.type === 'color' || attr.type === 'button') {
                        console.warn(`⚠️ ${attr.name} chưa có terms`);
                    }
                });

                // 4️⃣ Cập nhật map cho UI
                const termsMap = {};
                attributesWithTerms.forEach((attr) => {
                    termsMap[attr.attrId] = attr.terms.map((t) => ({
                        _id: t.termId,
                        name: t.name,
                        slug: t.slug,
                        color: t.colorCode,
                    }));
                });

                setAttributeTermsMap(termsMap);
                setProductAttributes(attributesWithTerms);

                console.log('🎯 Kết quả cuối:', attributesWithTerms);
            } catch (error) {
                console.error('❌ Lỗi lấy attributes:', error);
            }
        };

        fetchAttributesAndTerms();
    }, []);

    useEffect(() => {
        if (selectedColors.length && selectedSizes.length) {
            const combos = [];
            selectedColors.forEach((color) => {
                selectedSizes.forEach((size) => {
                    combos.push({
                        combination: `${color} / ${size}`,
                        price: '',
                        salePrice: '',
                        quantity: '',
                        sku: '',
                        image: null,
                    });
                });
            });
            setVariants(combos);
        }
    }, [selectedColors, selectedSizes]);

    useEffect(() => {
        // fetch categories
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data || []))
            .catch(() => setCategories([]));

        // fetch all attributes with terms
        fetchAttributesWithTerms();

        axios
            .get('http://localhost:5000/api/products', { params: { isAdmin: true, limit: 1000 } })
            .then((res) => setExistingProducts(res.data.products || []))
            .catch(() => setExistingProducts([]));
    }, []);

    useEffect(() => {
        if (!form.category) return;
        axios
            .get(`http://localhost:5000/api/categories/${form.category}`)
            .then((res) => {
                const attributes = res.data.attributes || [];
                const schema = attributes.map((a) => ({ label: a.name, key: a.key, type: a.type }));
                setCategorySchema(schema);

                const newSpecs = {};
                schema.forEach((item) => {
                    newSpecs[item.key] = form.specs[item.key] || '';
                });
                setForm((prev) => ({ ...prev, specs: newSpecs }));
            })
            .catch(() => setCategorySchema([]));
    }, [form.category]);

    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const fetchAttributesWithTerms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/attributes/with-terms');
            const attrs = res.data || [];
            setAllAttributes(attrs);

            // build quick map of terms for each attribute id
            const map = {};
            attrs.forEach((a) => {
                map[a._id] = a.terms || [];
            });
            setAttributeTermsMap(map);
        } catch (err) {
            console.error(err);
            setAllAttributes([]);
            setAttributeTermsMap({});
        }
    };

    // ---------- Form helpers ----------
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('specs.')) {
            const key = name.split('.')[1];
            setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
            return;
        }
        if (name.startsWith('image-')) {
            const idx = Number(name.split('-')[1]);
            const imgs = [...form.images];
            imgs[idx] = value;
            setForm((prev) => ({ ...prev, images: imgs }));
            return;
        }
        if (name === 'importing') {
            setForm((prev) => ({ ...prev, importing: checked, quantity: checked ? 0 : prev.quantity }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addImageField = () => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
    const removeImageField = (i) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

    // ---------- Attribute management (WP-like) ----------
    const addAttributeToProduct = (attrId) => {
        const attr = allAttributes.find((a) => a._id === attrId);
        if (!attr) return;
        if (productAttributes.some((a) => a.attrId === attrId)) return;
        setProductAttributes((prev) => [
            ...prev,
            { attrId: attr._id, name: attr.name, type: attr.type, useForVariations: false, terms: [] },
        ]);
    };

    const removeProductAttribute = (attrId) => {
        setProductAttributes((prev) => prev.filter((a) => a.attrId !== attrId));
    };

    const toggleUseForVariations = (attrId, checked) => {
        setProductAttributes((prev) =>
            prev.map((a) => (a.attrId === attrId ? { ...a, useForVariations: checked } : a)),
        );
    };

    // thay hàm cũ bằng hàm này
    const toggleTermForAttribute = (attrId, termOrId, checked) => {
        const termId = termOrId && typeof termOrId === 'object' ? termOrId._id : termOrId;
        setProductAttributes((prev) =>
            prev.map((a) => {
                if (a.attrId !== attrId) return a;
                const current = Array.isArray(a.terms) ? a.terms.map((t) => (typeof t === 'object' ? t._id : t)) : [];
                const newTerms = checked ? [...current, termId] : current.filter((t) => String(t) !== String(termId));
                return { ...a, terms: newTerms };
            }),
        );
    };

    // Build arrays for variation generation
    const generateVariantCombinations = () => {
        // chuẩn hóa: lấy các attribute được dùng cho biến thể và có ít nhất 1 termId
        console.log('productAttributes raw:', productAttributes);
        productAttributes.forEach((a, i) => {
            console.log(`Attr #${i}`, a);
        });

        const normalized = productAttributes
            .map((a) => ({
                attrId: a.attrId,
                name: a.name,
                useForVariations: a.useForVariations !== false,
                terms: (a.terms || []).map((t) => (typeof t === 'object' ? t._id : t)).filter(Boolean),
            }))
            .filter((a) => a.useForVariations && Array.isArray(a.terms) && a.terms.length > 0);
        console.log('Normalized attributes:', normalized);

        if (normalized.length === 0) {
            // debug: show current state (mở console khi dev)
            toast('Bạn cần chọn ít nhất 1 thuộc tính và ít nhất 1 term để sinh biến thể', 'error');
            return;
        }

        // arrays of { attributeId, termId }
        const arrays = normalized.map((a) => a.terms.map((termId) => ({ attributeId: a.attrId, termId })));

        // cartesian product
        const cartesian = arrays.reduce((acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])), [[]]);

        const newVariants = cartesian.map((combo, idx) => {
            const attributes = combo.map((c) => {
                const termObj = (attributeTermsMap[c.attributeId] || []).find(
                    (t) => String(t._id) === String(c.termId),
                ) || { _id: c.termId, name: String(c.termId) };
                return { attributeId: c.attributeId, termId: c.termId, term: termObj };
            });

            return {
                key: 'v-' + idx + '-' + combo.map((i) => i.termId).join('-'),
                attributes,
                price: '',
                discountPrice: '',
                quantity: '',
                sku: '',
                images: [],
                isOpen: false, // <-- thêm trường này
            };
        });

        setVariants(newVariants);
    };

    const handleVariantFieldChange = (index, field, value) => {
        setVariants((prev) => {
            const clone = [...prev];
            clone[index] = { ...clone[index], [field]: value };
            return clone;
        });
    };

    const handleTermSelect = (attrId, termId) => {
        setProductAttributes((prev) =>
            prev.map((attr) =>
                attr.attrId === attrId
                    ? {
                          ...attr,
                          terms: attr.terms.includes(termId)
                              ? attr.terms.filter((id) => id !== termId) // bỏ chọn
                              : [...attr.terms, termId], // thêm chọn
                      }
                    : attr,
            ),
        );
    };

    const handleAddAttribute = async (attribute) => {
        const terms = await fetchTermsByAttribute(attribute);

        setProductAttributes((prev) => [
            ...prev,
            {
                attrId: attribute._id,
                name: attribute.name,
                type: attribute.type,
                useForVariations: true,
                terms: terms.map((t) => t._id), // chỉ lấy ID hoặc để nguyên object nếu muốn
            },
        ]);
    };

    const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

    // ---------- Submit ----------
    const validateAndBuildPayload = () => {
        // duplicate name
        const isDuplicate = existingProducts.some(
            (p) => p.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
        );
        if (isDuplicate) {
            toast('Tên sản phẩm đã tồn tại', 'error');
            return null;
        }

        if (productType === 'variable' && variants.length === 0) {
            toast('Sản phẩm biến thể cần ít nhất một biến thể', 'error');
            return null;
        }

        if (form.importing && Number(form.quantity) !== 0) {
            toast('Khi đang nhập hàng, quantity phải bằng 0', 'error');
            return null;
        }

        // validate variants
        if (productType === 'variable') {
            for (const v of variants) {
                if (!v.price || Number(v.price) <= 0) {
                    toast('Mỗi biến thể cần giá hợp lệ', 'error');
                    return null;
                }
            }
        }

        // compute status array from (sum of variant qty) or form.quantity
        let statusArr = [];
        const totalQty =
            productType === 'variable'
                ? variants.reduce((s, v) => s + Number(v.quantity || 0), 0)
                : Number(form.quantity || 0);
        if (form.importing) statusArr.push('đang nhập hàng');
        else if (totalQty === 0) statusArr.push('hết hàng');
        else if (totalQty > 0 && totalQty < 15) statusArr.push('sắp hết hàng');
        else if (totalQty >= 15 && totalQty < 50) statusArr.push('còn hàng');
        else if (totalQty >= 50 && totalQty < 100) statusArr.push('nhiều hàng');
        else if (totalQty >= 100) statusArr.push('sản phẩm mới');

        const payload = {
            ...form,
            brand: (form.brand || '').trim(),
            price: productType === 'simple' ? Number(form.price) : Number(form.price || 0),
            discountPrice: productType === 'simple' ? Number(form.discountPrice || 0) : Number(form.discountPrice || 0),
            quantity:
                productType === 'simple'
                    ? Number(form.quantity || 0)
                    : variants.reduce((s, v) => s + Number(v.quantity || 0), 0),
            importing: !!form.importing,
            status: statusArr,
            productType,
            variantAttributes: [],
            variants: [],
        };

        if (productType === 'variable') {
            payload.variantAttributes = productAttributes.filter((a) => a.useForVariations).map((a) => a.attrId);
            payload.variants = variants.map((v) => ({
                attributes: v.attributes.map((a) => ({ attribute: a.attributeId, term: a.termId })),
                price: Number(v.price),
                discountPrice: Number(v.discountPrice || 0),
                quantity: Number(v.quantity || 0),
            }));
        }

        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = validateAndBuildPayload();
        if (!payload) return;

        try {
            await axios.post('http://localhost:5000/api/products', payload);
            toast('Tạo sản phẩm thành công', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            toast('Lỗi khi tạo sản phẩm', 'error');
        }
    };

    const toggleVariantOpen = (index, stopEvent) => {
        if (stopEvent) stopEvent.stopPropagation?.();
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, isOpen: !v.isOpen } : v)));
    };

    const editVariant = (e, index) => {
        e.stopPropagation();
        // nếu muốn mở modal để edit có thể làm ở đây; hiện tạm mở panel
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, isOpen: true } : v)));
    };

    const deleteVariant = (e, index) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Biến thể này sẽ bị xóa và không thể khôi phục!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                setVariants((prev) => prev.filter((_, i) => i !== index));
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Biến thể đã được xóa thành công.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    // ---------- Rendering ----------
    return (
        <div className={cx('page-wrapper')}>
            <form className={cx('layout')} onSubmit={handleSubmit}>
                <main className={cx('main-col')}>
                    {/* GENERAL metabox */}
                    <section className={cx('metabox')}>
                        <h3 className={cx('title')}>Thông tin chung</h3>
                        <div className={cx('field')}>
                            <label>Tên sản phẩm</label>
                            <input name="name" value={form.name} onChange={handleFormChange} required />
                        </div>

                        <div className={cx('field')}>
                            <label>Mô tả</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                rows={6}
                            />
                        </div>

                        <div className={cx('field', 'images')}>
                            <label>Ảnh sản phẩm</label>
                            {form.images.map((img, i) => (
                                <div className={cx('image-row')} key={i}>
                                    <input
                                        name={`image-${i}`}
                                        value={img}
                                        onChange={handleFormChange}
                                        placeholder={`URL ảnh ${i + 1}`}
                                    />
                                    <button type="button" onClick={() => removeImageField(i)}>
                                        X
                                    </button>
                                </div>
                            ))}
                            <button type="button" className={cx('btn')} onClick={addImageField}>
                                + Thêm ảnh
                            </button>
                        </div>

                        <div className={cx('field-row')}>
                            <div className={cx('field')}>
                                <label>Product Type</label>
                                <select value={productType} onChange={(e) => setProductType(e.target.value)}>
                                    <option value="simple">Sản phẩm đơn giản</option>
                                    <option value="variable">Sản phẩm biến thể</option>
                                </select>
                            </div>

                            {productType === 'simple' && (
                                <>
                                    <div className={cx('field')}>
                                        <label>Giá gốc</label>
                                        <input
                                            name="price"
                                            type="number"
                                            value={form.price}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div className={cx('field')}>
                                        <label>Giá khuyến mãi</label>
                                        <input
                                            name="discountPrice"
                                            type="number"
                                            value={form.discountPrice}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* specs grid from categorySchema */}
                        <div className={cx('specs')}>
                            <h4>Thông số kỹ thuật</h4>
                            <div className={cx('specs-grid')}>
                                {categorySchema.map((f, i) => (
                                    <div key={i} className={cx('spec-item')}>
                                        <label>{f.label || f.key}</label>
                                        <input
                                            name={`specs.${f.key}`}
                                            value={form.specs[f.key] || ''}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Attributes & Variants metaboxes (only show attributes & variant editor when variable) */}
                    {productType === 'variable' && (
                        <>
                            <section className={cx('metabox')}>
                                <h3 className={cx('title')}>Thuộc tính (Attributes)</h3>
                                <div className={cx('attr-pick')}>
                                    <label>Thêm thuộc tính có sẵn</label>
                                    <div className={cx('attr-list')}>
                                        {allAttributes.map((a) => (
                                            <button
                                                key={a._id}
                                                type="button"
                                                className={cx('chip')}
                                                onClick={() => addAttributeToProduct(a._id)}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className={cx('product-attributes')}>
                                        {productAttributes.map((attr) => (
                                            <div key={attr.attrId} className={cx('attr-card')}>
                                                <div className={cx('attr-header')}>
                                                    <strong>{attr.name}</strong>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductAttribute(attr.attrId)}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                                <div className={cx('attr-body')}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={attr.useForVariations}
                                                            onChange={(e) =>
                                                                toggleUseForVariations(attr.attrId, e.target.checked)
                                                            }
                                                        />
                                                        Dùng cho biến thể
                                                    </label>

                                                    <div className={cx('terms')}>
                                                        {(attributeTermsMap[attr.attrId] || []).map((t) => {
                                                            const isChecked =
                                                                Array.isArray(attr.terms) &&
                                                                attr.terms.some(
                                                                    (termId) => String(termId) === String(t._id),
                                                                );
                                                            return (
                                                                <label key={t._id} className={cx('term')}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={(e) =>
                                                                            toggleTermForAttribute(
                                                                                attr.attrId,
                                                                                t._id,
                                                                                e.target.checked,
                                                                            )
                                                                        }
                                                                    />
                                                                    {t.name}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={cx('attr-actions')}>
                                        <button
                                            type="button"
                                            className={cx('btn')}
                                            onClick={generateVariantCombinations}
                                        >
                                            Tạo biến thể từ thuộc tính
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* PHẦN RENDER BIẾN THỂ */}
                            {variants.length > 0 && (
                                <div className={cx('variants-section')}>
                                    <h3 className={cx('variants-title')}>Tổ hợp biến thể</h3>

                                    <div className={cx('variants-list')}>
                                        {variants.map((v, i) => (
                                            <div key={v.key || i} className={cx('variant-card')}>
                                                {/* Header */}
                                                <div
                                                    className={cx('variant-header')}
                                                    onClick={() => toggleVariantOpen(i)}
                                                    role="button"
                                                >
                                                    <div className={cx('variant-left')}>
                                                        <span className={cx('arrow', { open: v.isOpen })} aria-hidden>
                                                            ▶
                                                        </span>
                                                        <span className={cx('variant-label')}>
                                                            {v.attributes
                                                                .map((a) => a.term?.name || a.termId)
                                                                .join(' — ')}
                                                        </span>
                                                    </div>

                                                    <div className={cx('variant-actions')}>
                                                        <button
                                                            type="button"
                                                            className={cx('btn', 'btn-edit')}
                                                            onClick={(e) => editVariant(e, i)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={cx('btn', 'btn-delete')}
                                                            onClick={(e) => deleteVariant(e, i)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Body (chi tiết) */}
                                                <AnimatePresence>
                                                    {v.isOpen && (
                                                        <motion.div
                                                            className="variant-body"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <div className={cx('variant-body')}>
                                                                <div className={cx('form-row')}>
                                                                    <label>Giá thường</label>
                                                                    <input
                                                                        type="number"
                                                                        value={v.price}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                i,
                                                                                'price',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className={cx('form-row')}>
                                                                    <label>Giá khuyến mãi</label>
                                                                    <input
                                                                        type="number"
                                                                        value={v.discountPrice}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                i,
                                                                                'discountPrice',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className={cx('form-row')}>
                                                                    <label>Số lượng</label>
                                                                    <input
                                                                        type="number"
                                                                        value={v.quantity}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                i,
                                                                                'quantity',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className={cx('form-row')}>
                                                                    <label>SKU</label>
                                                                    <input
                                                                        type="text"
                                                                        value={v.sku}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                i,
                                                                                'sku',
                                                                                e.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className={cx('form-row')}>
                                                                    <label>Hình ảnh</label>
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                i,
                                                                                'image',
                                                                                e.target.files[0],
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>

                <aside className={cx('side-col')}>
                    <section className={cx('metabox')}>
                        <h4 className={cx('title-sm')}>Publish</h4>
                        <div className={cx('field')}>
                            <label>Danh mục</label>
                            <select name="category" value={form.category} onChange={handleFormChange}>
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={cx('field')}>
                            <label>Thương hiệu</label>
                            <input name="brand" value={form.brand} onChange={handleFormChange} placeholder="VD: ASUS" />
                        </div>

                        {productType === 'simple' && (
                            <div className={cx('field')}>
                                <label>Số lượng</label>
                                <input
                                    name="quantity"
                                    type="number"
                                    value={form.quantity}
                                    onChange={handleFormChange}
                                    min={0}
                                />
                            </div>
                        )}

                        <div className={cx('field')}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="importing"
                                    checked={form.importing}
                                    onChange={handleFormChange}
                                />
                                Đang nhập hàng
                            </label>
                        </div>

                        <div className={cx('actions')}>
                            <button type="submit" className={cx('btn', 'primary')}>
                                Tạo sản phẩm
                            </button>
                        </div>
                    </section>
                </aside>
            </form>
        </div>
    );
}
