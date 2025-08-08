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
        brand: '',
        description: '',
        rating: '',
        quantity: '',
        importing: false,
    });

    const [categories, setCategories] = useState([]);
    const [categorySchema, setCategorySchema] = useState([]);

    const [existingProducts, setExistingProducts] = useState([]);

    // Quản lý state biến thể
    const [hasVariants, setHasVariants] = useState(false);
    const [variantAttributes, setVariantAttributes] = useState([]); // các thuộc tính có term
    const [selectedVariantAttributes, setSelectedVariantAttributes] = useState([]); // user chọn

    // chi tiết attributeTerm
    const [attributeTermsMap, setAttributeTermsMap] = useState({}); // { attributeId: [terms] }
    console.log(attributeTermsMap);
    const [variantCombinations, setVariantCombinations] = useState([]); // [{ key, attributes: [{attrId, term}], price, ... }]

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/products', {
                params: { isAdmin: true, limit: 1000 }, // 👈 tránh phân trang để lấy đủ
            })
            .then((res) => {
                const products = res.data.products || []; // ✅ lấy đúng mảng
                setExistingProducts(products);
            })
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

    // Gửi về backend khi submit
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

        if (hasVariants && selectedVariantAttributes.length === 0) {
            toast('Bạn cần chọn ít nhất một thuộc tính cho biến thể', 'error');
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
                brand: formData.brand.trim(),
                quantity: formData.importing ? 0 : Number(formData.quantity),
                status: statusArr,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                variantAttributes: hasVariants ? selectedVariantAttributes : [],
            };

            if (hasVariants) {
                payload.variants = variantCombinations.map((variant) => ({
                    attributes: variant.attributes.map((a) => ({
                        attribute: a.attributeId,
                        term: a.term._id,
                    })),
                    price: Number(variant.price),
                    discountPrice: Number(variant.discountPrice),
                    quantity: Number(variant.quantity),
                }));
            }

            await axios.post('http://localhost:5000/api/products', payload);
            toast('Thêm sản phẩm thành công!', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi tạo sản phẩm:', err);
            toast('Lỗi khi tạo sản phẩm!', 'error');
        }
    };

    // Gọi API lấy danh sách Attribute có Term
    const fetchVariantAttributes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/attributes/with-terms');
            // API này bạn cần tạo riêng trong backend (phía dưới mình gợi ý)
            setVariantAttributes(res.data || []);
        } catch (err) {
            console.error('Lỗi tải thuộc tính biến thể:', err);
        }
    };

    const handleSelectVariantAttribute = async (attributeId, checked) => {
        console.log('Selected attribute:', attributeId, 'Checked:', checked);
        if (checked) {
            // Add
            setSelectedVariantAttributes((prev) => [...prev, attributeId]);

            const res = await axios.get(`http://localhost:5000/api/attribute-terms/by-attribute/${attributeId}`);
            console.log('Fetched terms for', attributeId, res.data);

            const terms = res.data || [];

            setAttributeTermsMap((prev) => ({
                ...prev,
                [attributeId]: terms,
            }));
        } else {
            // Remove
            setSelectedVariantAttributes((prev) => prev.filter((id) => id !== attributeId));
            setAttributeTermsMap((prev) => {
                const newMap = { ...prev };
                delete newMap[attributeId];
                return newMap;
            });
        }
    };

    // Sinh tổ hợp biến thể
    function cartesianProduct(arrays) {
        return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
    }

    useEffect(() => {
        if (Object.keys(attributeTermsMap).length === 0) {
            setVariantCombinations([]);
            return;
        }

        const allTerms = selectedVariantAttributes.map((attrId) => {
            return attributeTermsMap[attrId].map((term) => ({
                attributeId: attrId,
                term,
            }));
        });

        const combos = cartesianProduct(allTerms).map((combo, index) => ({
            key: `variant-${index}`,
            attributes: combo,
            price: '',
            discountPrice: '',
            quantity: '',
        }));

        setVariantCombinations(combos);
    }, [attributeTermsMap]);

    const handleVariantChange = (index, field, value) => {
        setVariantCombinations((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
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

                <label>Thương hiệu</label>
                <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="VD: ASUS, Acer, Lenovo..."
                    required
                />

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

                {/* Khi checkbox sản phẩm có biến thể thay đổi */}
                <div className={cx('checkbox-wrapper')}>
                    <input
                        type="checkbox"
                        id="hasVariants"
                        checked={hasVariants}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setHasVariants(checked);

                            if (checked) {
                                fetchVariantAttributes(); // Gọi API để lấy danh sách attribute có term
                            } else {
                                setSelectedVariantAttributes([]);
                                setAttributeTermsMap({});
                                setVariantCombinations([]);
                            }
                        }}
                    />
                    <label htmlFor="hasVariants">Sản phẩm có biến thể</label>
                </div>

                {/* Hiển thị form chọn các thuộc tính */}
                {hasVariants && (
                    <div className={cx('variant-attributes')}>
                        <h4>Chọn các thuộc tính áp dụng cho biến thể:</h4>
                        {variantAttributes.map((attr) => (
                            <div key={attr._id} className={cx('variant-option')}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedVariantAttributes.includes(attr._id)}
                                        onChange={(e) => handleSelectVariantAttribute(attr._id, e.target.checked)}
                                    />
                                    {attr.name} ({attr.type})
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {/* Render bảng nhập giá */}
                {variantCombinations.length > 0 && (
                    <table className={cx('variant-table')}>
                        <thead>
                            <tr>
                                {selectedVariantAttributes.map((attrId) => {
                                    const attr = variantAttributes.find((a) => a._id === attrId);
                                    return <th key={attrId}>{attr?.name}</th>;
                                })}
                                <th>Giá</th>
                                <th>Giá KM</th>
                                <th>Số lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variantCombinations.map((variant, idx) => (
                                <tr key={variant.key}>
                                    {variant.attributes.map((attr) => (
                                        <td key={attr.term._id}>{attr.term.name}</td>
                                    ))}
                                    <td>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={variant.discountPrice}
                                            onChange={(e) => handleVariantChange(idx, 'discountPrice', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

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
