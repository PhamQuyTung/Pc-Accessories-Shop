import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './CreateProduct.module.scss';
import { useNavigate } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';
import { computeProductStatus } from 'shared-utils';
import { registerQuillModules } from '~/utils/quillSetup';

import ProductGeneral from './components/ProductGeneral';
import SidePublish from './components/SidePublish';
registerQuillModules();

const cx = classNames.bind(styles);

export default function CreateProduct() {
    const toast = useToast();
    const navigate = useNavigate();

    // Basic form data (kept minimal)
    const [form, setForm] = useState({
        name: '',
        shortDescription: '',
        longDescription: '',
        images: [''],
        price: '',
        discountPrice: '',
        quantity: '',
        importing: false,
        brand: '',
        category: '',
        specs: {},
        isBestSeller: false,
    });

    // product type and related states
    const [productType, setProductType] = useState('simple');
    const [allAttributes, setAllAttributes] = useState([]);
    const [attributeTermsMap, setAttributeTermsMap] = useState({});
    const [productAttributes, setProductAttributes] = useState([]);
    const [variants, setVariants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [existingProducts, setExistingProducts] = useState([]);

    const initialFormRef = useRef(form);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    useEffect(() => {
        setHasUnsavedChanges(
            JSON.stringify(form) !== JSON.stringify(initialFormRef.current) || productType !== 'simple',
        );
    }, [form, productType]);

    // fetch attributes/terms, brands, categories, products (kept same calls)
    useEffect(() => {
        const fetch = async () => {
            try {
                const resAttr = await axiosClient.get('/attributes');
                const attributes = Array.isArray(resAttr) ? resAttr : resAttr.data || [];
                // fetch terms per attribute
                const attributesWithTerms = await Promise.all(
                    attributes.map(async (attr) => {
                        if (attr.type === 'text') return { _id: attr._id, name: attr.name, type: attr.type, terms: [] };
                        try {
                            const { data } = await axiosClient.get(`/attribute-terms/${attr._id}`);
                            const terms = Array.isArray(data) ? data : data?.data || [];
                            return { _id: attr._id, name: attr.name, type: attr.type, terms };
                        } catch {
                            return { _id: attr._id, name: attr.name, type: attr.type, terms: [] };
                        }
                    }),
                );
                const map = {};
                attributesWithTerms.forEach((a) => {
                    map[a._id] = (a.terms || []).map((t) => ({ _id: t._id, name: t.name }));
                });
                setAttributeTermsMap(map);
                setAllAttributes(attributesWithTerms);
            } catch (err) {
                console.error(err);
            }
        };
        fetch();

        axiosClient
            .get('/brands')
            .then((r) => setBrands(r.data || []))
            .catch(() => {});
        axiosClient
            .get('/categories')
            .then((r) => setCategories(r.data || []))
            .catch(() => {});
        axiosClient
            .get('/products', { params: { isAdmin: true, limit: 1000 } })
            .then((r) => setExistingProducts(r.data.products || []))
            .catch(() => {});
    }, []);

    // helpers moved here and passed down
    const handleFormChange = (e) => {
        // support synthetic calls from Quill where we pass object
        if (e && e.target && typeof e.target.name === 'string') {
            const { name, value, type, checked } = e.target;
            if (name.startsWith('specs.')) {
                const key = name.split('.')[1];
                setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
                return;
            }
            if (name.startsWith('image-')) {
                const idx = Number(name.split('-')[1]);
                setForm((prev) => ({ ...prev, images: prev.images.map((im, i) => (i === idx ? value : im)) }));
                return;
            }
            if (name === 'importing') {
                setForm((prev) => ({ ...prev, importing: checked, quantity: checked ? 0 : prev.quantity }));
                return;
            }
            setForm((prev) => ({ ...prev, [name]: value }));
        } else if (e && e.name) {
            // synthetic call: { name, value }
            const { name, value } = e;
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addImageField = () => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
    const removeImageField = (i) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

    // attribute/product attribute management (copied core logic)
    const addAttributeToProduct = (attrId) => {
        const attr = allAttributes.find((a) => a._id === attrId);
        if (!attr) return;
        if (productAttributes.some((a) => a.attrId === attrId)) return;
        setProductAttributes((prev) => [
            ...prev,
            { attrId: attr._id, name: attr.name, type: attr.type, useForVariations: false, terms: [] },
        ]);
    };
    const removeProductAttribute = (attrId) => setProductAttributes((prev) => prev.filter((a) => a.attrId !== attrId));
    const toggleUseForVariations = (attrId, checked) =>
        setProductAttributes((prev) =>
            prev.map((a) => (a.attrId === attrId ? { ...a, useForVariations: checked } : a)),
        );
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

    // generateVariantCombinations (kept same)
    const generateVariantCombinations = () => {
        const normalized = productAttributes
            .map((a) => ({
                attrId: a.attrId,
                name: a.name,
                useForVariations: a.useForVariations !== false,
                terms: (a.terms || []).map((t) => (typeof t === 'object' ? t._id : t)).filter(Boolean),
            }))
            .filter((a) => a.useForVariations && Array.isArray(a.terms) && a.terms.length > 0);

        if (normalized.length === 0) {
            toast('Bạn cần chọn ít nhất 1 thuộc tính và ít nhất 1 term để sinh biến thể', 'error');
            return;
        }

        const arrays = normalized.map((a) => a.terms.map((termId) => ({ attributeId: a.attrId, termId })));
        const cartesian = arrays.reduce((acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])), [[]]);

        const newVariants = cartesian.map((combo, idx) => {
            const attributes = combo.map((c) => {
                const termObj = (attributeTermsMap[c.attributeId] || []).find(
                    (t) => String(t._id) === String(c.termId),
                ) || { _id: c.termId, name: String(c.termId) };
                return { attributeId: c.attributeId, termId: c.termId, term: termObj };
            });
            return {
                key: `v-${idx}-${combo.map((i) => i.termId).join('-')}`,
                attributes,
                price: '',
                discountPrice: '',
                quantity: '',
                sku: '',
                images: [],
                isOpen: false,
            };
        });

        setVariants(newVariants);
    };

    const handleVariantChange = (index, field, value) => {
        setVariants((prev) => {
            const updated = [...prev];
            // support nested paths like 'dimensions.length'
            if (field.includes('.')) {
                const [f, sub] = field.split('.');
                updated[index] = { ...updated[index], [f]: { ...(updated[index][f] || {}), [sub]: value } };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
    };

    const toggleVariantOpen = (index) =>
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, isOpen: !v.isOpen } : v)));
    const editVariant = (e, index) => {
        e.stopPropagation();
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, isOpen: true } : v)));
    };
    const deleteVariant = (e, index) => {
        e.stopPropagation();
        if (window.confirm('Xóa biến thể?')) setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    // validate  build payload (kept minimal)
    const validateAndBuildPayload = () => {
        if (!form.name.trim()) {
            toast('Tên sản phẩm không được để trống', 'error');
            return null;
        }

        if (productType === 'variable' && variants.length === 0) {
            toast('Sản phẩm biến thể cần ít nhất một biến thể', 'error');
            return null;
        }

        const payload = {
            ...form,
            price: Number(form.price || 0),
            discountPrice: Number(form.discountPrice || 0),
            quantity: Number(form.quantity || 0),
            productType,
        };

        if (productType === 'variable') {
            payload.attributes = productAttributes
                .filter((a) => a.useForVariations)
                .map((a) => ({
                    attrId: a.attrId,
                    terms: (a.terms || []).map((t) => (typeof t === 'object' ? t._id : t)),
                }));

            payload.variations = variants.map((v) => ({
                attributes: (v.attributes || []).map((a) => ({
                    attrId: a.attributeId ?? a.attrId,
                    termId: a.termId ?? a.term?._id,
                })),
                price: Number(v.price || 0),
                discountPrice: Number(v.discountPrice || 0),
                quantity: Number(v.quantity || 0),
                sku: v.sku || '',
                images: v.images?.filter(Boolean) || [],
            }));
        }

        return payload;
    };

    const handleSubmit = async (e) => {
        e && e.preventDefault && e.preventDefault();
        const payload = validateAndBuildPayload();
        if (!payload) return;
        try {
            await axios.post('http://localhost:5000/api/products', payload);
            toast('Tạo sản phẩm thành công', 'success');
            initialFormRef.current = form;
            setHasUnsavedChanges(false);
            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            toast('Lỗi khi tạo sản phẩm', 'error');
        }
    };

    // thêm handler chuyển loại sản phẩm
    const handleProductTypeChange = (type) => {
        if (type === productType) return;
        setProductType(type);
        if (type === 'simple') {
            // khi chuyển về simple, bỏ variants và attributes để tránh dữ liệu thừa
            setVariants([]);
            setProductAttributes([]);
        }
    };

    return (
        <div className={cx('page-wrapper')}>
            <form className={cx('layout')} onSubmit={handleSubmit}>
                <main className={cx('main-col')}>
                    {/* --- Chọn loại sản phẩm --- */}
                    <div className={cx('metabox', 'product-type-box')}>
                        <h3 className={cx('title')}>Loại sản phẩm</h3>
                        <div className={cx('type-options')}>
                            <button
                                type="button"
                                className={cx('btn', { active: productType === 'simple' })}
                                aria-pressed={productType === 'simple'}
                                onClick={() => handleProductTypeChange('simple')}
                            >
                                Sản phẩm thường
                            </button>
                            {/* <button
                                type="button"
                                className={cx('btn', { active: productType === 'variable' })}
                                aria-pressed={productType === 'variable'}
                                onClick={() => handleProductTypeChange('variable')}
                            >
                                Sản phẩm có biến thể
                            </button> */}
                        </div>
                    </div>

                    <ProductGeneral
                        form={form}
                        handleFormChange={handleFormChange}
                        addImageField={addImageField}
                        removeImageField={removeImageField}
                        productType={productType}
                    />
                    {/* {productType === 'variable' && (
                        <>
                            <AttributesPanel
                                allAttributes={allAttributes}
                                attributeTermsMap={attributeTermsMap}
                                productAttributes={productAttributes}
                                addAttributeToProduct={addAttributeToProduct}
                                removeProductAttribute={removeProductAttribute}
                                toggleUseForVariations={toggleUseForVariations}
                                toggleTermForAttribute={toggleTermForAttribute}
                                generateVariantCombinations={generateVariantCombinations}
                            />
                            <VariantsEditor
                                variants={variants}
                                handleVariantChange={handleVariantChange}
                                toggleVariantOpen={toggleVariantOpen}
                                editVariant={editVariant}
                                deleteVariant={deleteVariant}
                            />
                        </>
                    )} */}
                </main>

                <SidePublish
                    form={form}
                    categories={categories}
                    brands={brands}
                    productType={productType}
                    variants={variants}
                    formImporting={form.importing}
                    handleFormChange={handleFormChange}
                    computeProductStatus={computeProductStatus}
                    handleSubmit={handleSubmit}
                    hasUnsavedChanges={hasUnsavedChanges}
                    initialFormRef={initialFormRef}
                />
            </form>
        </div>
    );
}
