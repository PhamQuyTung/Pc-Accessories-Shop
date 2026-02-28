import React, { useState, useEffect } from 'react';
import styles from './CheckoutPage.module.scss';
import classNames from 'classnames/bind';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';
import axiosClient from '~/utils/axiosClient';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';
import AddressSelector from '~/components/AdressComponent/AddressSelector/AddressSelector';
import SavedAddressList from '~/components/AdressComponent/SavedAddressList/SavedAddressList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CheckoutPage() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        postalCode: '',
        address1: '',
        address2: '',
        city: '',
        province: '',
        district: '',
        ward: '',
        phone: '',
        email: '',
        deliveryMethod: 'standard',
        installService: 'no',
    });

    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [promotionSummary, setPromotionSummary] = useState({ totalDiscount: 0, discounts: [] });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [activeTab, setActiveTab] = useState('select');
    const [agreed, setAgreed] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    // === Tính toán tổng giá ===
    const installFee = form.installService === 'yes' ? 200000 : 0;
    const totalDiscount = promotionSummary.totalDiscount || 0;
    // `subtotal` state is computed after promotions (excluding gifts), so use it directly
    const subtotalAfterPromo = subtotal;
    const tax = Math.round(subtotalAfterPromo * 0.15);
    const total = subtotalAfterPromo + tax + installFee + (form.deliveryMethod === 'express' ? 40000 : 0);

    // === Tính tổng phụ sau khi áp dụng khuyến mãi (từng sản phẩm) ===
    const calcSubtotalAfterPromotion = () => {
        return cartItems.reduce((sum, item) => {
            // Skip gift items — they are free and should not contribute to subtotal
            if (item.isGift) return sum;
            const product = item.product_id;
            const basePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            const promoItem = promotionSummary.discounts.find((d) => d.productId === product._id);

            if (promoItem) {
                const discountedPrice = basePrice - promoItem.discountPerItem;
                const totalDiscounted = promoItem.discountedQty * discountedPrice;
                const totalNormal = promoItem.normalQty * basePrice;
                return sum + totalDiscounted + totalNormal;
            } else {
                return sum + basePrice * item.quantity;
            }
        }, 0);
    };

    // ================= HELPER: Extract price data from product/variation =================
    const getPriceData = (product, variation) => {
        const toNum = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);

        if (variation) {
            // ✅ Ưu tiên lấy từ variation
            const discountPrice = toNum(variation.discountPrice);
            const price = toNum(variation.price);

            return {
                basePrice: discountPrice > 0 ? discountPrice : price,
                originalPrice: price,
                hasDiscount: discountPrice > 0 && discountPrice < price,
            };
        } else {
            // Fallback to product
            const discountPrice = toNum(product.discountPrice);
            const price = toNum(product.price);

            return {
                basePrice: discountPrice > 0 ? discountPrice : price,
                originalPrice: price,
                hasDiscount: discountPrice > 0 && discountPrice < price,
            };
        }
    };

    // ================= HELPER: Extract variation attributes label =================
    const getVariationLabel = (variation) => {
        if (!variation || !variation.attributes || variation.attributes.length === 0) {
            return null;
        }

        return variation.attributes
            .map((attr) => {
                const attrName = attr.attrId?.name || 'Attr';
                const termName = Array.isArray(attr.terms)
                    ? attr.terms[0]?.name || attr.terms[0]
                    : attr.terms?.name || attr.terms;

                return `${attrName}: ${termName}`;
            })
            .filter(Boolean)
            .join(' - ');
    };

    // === Lấy giỏ hàng + khuyến mãi ===
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosClient.get('/carts/');
                const items = Array.isArray(res.data.items) ? res.data.items : [];
                setCartItems(items);

                // Gọi API tính khuyến mãi và tính subtotal sau khi áp khuyến mãi
                let promoData = { discounts: [], totalDiscount: 0 };
                if (items.length > 0) {
                    const promoRes = await axiosClient.post('/promotion-gifts/apply-cart', {
                        cartItems: items.map((i) => ({
                            product_id: i.product_id._id,
                            variation_id: i.variation_id?._id || null,
                            quantity: i.quantity,
                            createdAt: i.createdAt,
                        })),
                    });
                    promoData = promoRes.data || promoData;
                    setPromotionSummary(promoData);
                }

                // Tính subtotal dựa trên kết quả khuyến mãi (đồng bộ với calcSubtotalAfterPromotion)
                const subAfterPromo = items.reduce((acc, item) => {
                    // Skip gift items — they are free and should not contribute to subtotal
                    if (item.isGift) return acc;

                    const product = item.product_id || {};
                    const variation = item.variation_id || null;
                    const { basePrice } = getPriceData(product, variation);

                    const relatedPromo = (promoData.discounts || []).find(
                        (d) => String(d.productId) === String(product._id),
                    );

                    if (relatedPromo) {
                        const discountedPrice = basePrice - relatedPromo.discountPerItem;
                        const totalDiscounted = (relatedPromo.discountedQty || 0) * discountedPrice;
                        const totalNormal = (relatedPromo.normalQty || 0) * basePrice;
                        return acc + totalDiscounted + totalNormal;
                    } else {
                        return acc + basePrice * (item.quantity || 1);
                    }
                }, 0);

                setSubtotal(subAfterPromo);
            } catch (err) {
                console.error('Lỗi khi lấy giỏ hàng:', err);
            }
        };
        fetchCart();
    }, []);

    // === Lấy địa chỉ ===
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axiosClient.get('/addresses');
                setSavedAddresses(res.data || []);
                const defaultAddress = res.data?.find((addr) => addr.isDefault);
                if (defaultAddress) setSelectedAddressId(defaultAddress._id);
            } catch (err) {
                console.error('Lỗi khi lấy địa chỉ:', err);
            }
        };
        fetchAddresses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOrder = () => {
        if (!selectedAddressId) return;
        const address = savedAddresses.find((addr) => addr._id === selectedAddressId);
        if (!address) return;

        const payload = {
            shippingInfo: {
                fullName: `${address.firstName} ${address.lastName}`,
                phone: address.phone,
                email: address.email,
                address: `${address.detail}, ${address.ward}, ${address.district}, ${address.city}, ${address.postalCode}`,
                subtotal,
                tax,
                deliveryFee: form.deliveryMethod === 'express' ? 40000 : 0,
                installFee,
                total,
            },
            products: cartItems,
        };

        sessionStorage.setItem('checkoutData', JSON.stringify(payload));
        navigate('/payment', { state: payload });
    };

    // === Hàm render giỏ hàng tách dòng (UPDATE) ===
    const renderCartRow = (item) => {
        const product = item.product_id;
        const variation = item.variation_id || null;
        const productId = product._id;

        const isGift = !!item.isGift;

        // ✅ Lấy giá từ variation hoặc product
        const { basePrice, originalPrice, hasDiscount } = getPriceData(product, variation);

        // ✅ Lấy ảnh ưu tiên từ variation
        const imageSrc = variation?.images?.[0] || product.images?.[0];

        // ✅ Lấy variation attributes label
        const variationLabel = getVariationLabel(variation);

        const promoItem = promotionSummary.discounts.find((d) => d.productId === productId);

        const rows = [];

        // If this cart entry is a gift, render as free with a clear description
        if (isGift) {
            rows.push(
                <div key={`gift-${item._id}`} className={cx('cart-item')}>
                    <img src={imageSrc || '/placeholder.png'} alt={product.name} />
                    <div className={cx('cart-item__info')}>
                        <p className={cx('cart-item__name')}>{product.name}</p>
                        {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                        {item.parentProductId && (
                            <div className={cx('promo-tag')}>
                                🎁 Quà tặng miễn phí khi mua{' '}
                                <Link to={`/products/${item.parentProductId.slug}`}>{item.parentProductId.name}</Link>
                            </div>
                        )}
                        <p className={cx('cart-item__qty')}>SL: {item.quantity}</p>
                        <p className={cx('cart-item__price')}>Đơn giá: 0₫</p>
                        <div className={cx('cart-item__total')}>
                            <span>Thành tiền:</span>
                            <strong>0₫</strong>
                        </div>
                    </div>
                </div>,
            );

            return rows;
        }

        if (promoItem) {
            // Dòng khuyến mãi
            if (promoItem.discountedQty > 0) {
                const discountedPrice = basePrice - promoItem.discountPerItem;
                const totalDiscounted = promoItem.discountedQty * discountedPrice;

                rows.push(
                    <div key={`${productId}-promo`} className={cx('cart-item', 'promo-row')}>
                        <img src={imageSrc || '/placeholder.png'} alt={product.name} />
                        <div className={cx('cart-item__info')}>
                            <p className={cx('cart-item__name')}>{product.name}</p>
                            {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                            <div className={cx('promo-tag')}>🎁 {promoItem.promotionTitle}</div>
                            <p className={cx('cart-item__qty')}>SL: {promoItem.discountedQty}</p>
                            <p className={cx('cart-item__price')}>Đơn giá: {discountedPrice.toLocaleString()}₫</p>
                            <div className={cx('cart-item__total')}>
                                <span>Thành tiền:</span>
                                <strong>{totalDiscounted.toLocaleString()}₫</strong>
                            </div>
                        </div>
                    </div>,
                );
            }

            // Dòng thường
            if (promoItem.normalQty > 0) {
                const totalNormal = promoItem.normalQty * basePrice;

                rows.push(
                    <div key={`${productId}-normal`} className={cx('cart-item')}>
                        <img src={imageSrc || '/placeholder.png'} alt={product.name} />
                        <div className={cx('cart-item__info')}>
                            <p className={cx('cart-item__name')}>{product.name}</p>
                            {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                            <p className={cx('cart-item__qty')}>SL: {promoItem.normalQty}</p>
                            <p className={cx('cart-item__price')}>Đơn giá: {basePrice.toLocaleString()}₫</p>
                            <div className={cx('cart-item__total')}>
                                <span>Thành tiền:</span>
                                <strong>{totalNormal.toLocaleString()}₫</strong>
                            </div>
                        </div>
                    </div>,
                );
            }
        } else {
            // Không có khuyến mãi
            const totalNormal = basePrice * item.quantity;

            rows.push(
                <div key={productId} className={cx('cart-item')}>
                    <img src={imageSrc || '/placeholder.png'} alt={product.name} />
                    <div className={cx('cart-item__info')}>
                        <p className={cx('cart-item__name')}>{product.name}</p>
                        {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                        <p className={cx('cart-item__qty')}>SL: {item.quantity}</p>
                        <p className={cx('cart-item__price')}>Đơn giá: {basePrice.toLocaleString()}₫</p>
                        <div className={cx('cart-item__total')}>
                            <span>Thành tiền:</span>
                            <strong>{totalNormal.toLocaleString()}₫</strong>
                        </div>
                    </div>
                </div>,
            );
        }

        return rows;
    };

    return (
        <div className={cx('checkout')}>
            <CheckoutStep currentStep={2} />
            <div className={cx('checkout-content')}>
                <Link to="/carts" className={cx('back-link')}>
                    <FontAwesomeIcon icon={faAngleLeft} style={{ marginRight: '10px' }} /> Trở về
                </Link>

                <div className={cx('checkout-container')}>
                    {/* ==== Form vận chuyển ==== */}
                    <div className={cx('form-section', 'fade-in', 'fade-delay-1')}>
                        <h2>2. VẬN CHUYỂN</h2>
                        <div className={cx('tab-header')}>
                            <button
                                className={cx({ active: activeTab === 'select' })}
                                onClick={() => setActiveTab('select')}
                            >
                                Chọn địa chỉ đã lưu
                            </button>
                            <button
                                className={cx({ active: activeTab === 'form' })}
                                onClick={() => setActiveTab('form')}
                            >
                                Nhập địa chỉ mới
                            </button>
                        </div>

                        <div className={cx('tab-content')}>
                            {activeTab === 'select' ? (
                                <SavedAddressList
                                    addresses={savedAddresses}
                                    activeAddressId={selectedAddressId}
                                    onSelect={setSelectedAddressId}
                                    onOrder={handleOrder}
                                />
                            ) : (
                                <AddressSelectorForm
                                    form={form}
                                    onChange={handleChange}
                                    agreed={agreed}
                                    setAgreed={setAgreed}
                                    onSubmit={handleOrder}
                                />
                            )}
                        </div>

                        {/* ==== Tuỳ chọn giao hàng & lắp đặt ==== */}
                        <div className={cx('form-field')}>
                            <label>Phương thức giao hàng:</label>
                            <div className={cx('delivery-options')}>
                                <div
                                    className={cx('delivery-card', { active: form.deliveryMethod === 'standard' })}
                                    onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'standard' }))}
                                >
                                    <h4>🚚 Giao tiêu chuẩn</h4>
                                    <p>Miễn phí giao hàng (3–5 ngày)</p>
                                </div>

                                <div
                                    className={cx('delivery-card', { active: form.deliveryMethod === 'express' })}
                                    onClick={() => setForm((prev) => ({ ...prev, deliveryMethod: 'express' }))}
                                >
                                    <h4>⚡ Giao nhanh</h4>
                                    <p>40.000₫ – Nhận trong 24–48h</p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-field')}>
                            <label>Dịch vụ lắp đặt:</label>
                            <div className={cx('delivery-options')}>
                                <div
                                    className={cx('delivery-card', { active: form.installService === 'no' })}
                                    onClick={() => setForm((prev) => ({ ...prev, installService: 'no' }))}
                                >
                                    <h4>🔧 Tự lắp đặt</h4>
                                    <p>Miễn phí – hướng dẫn chi tiết qua email</p>
                                </div>

                                <div
                                    className={cx('delivery-card', { active: form.installService === 'yes' })}
                                    onClick={() => setForm((prev) => ({ ...prev, installService: 'yes' }))}
                                >
                                    <h4>🧑‍🔧 Nhờ TECHVN lắp đặt</h4>
                                    <p>200.000₫ – hỗ trợ tận nơi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==== Tóm tắt đơn hàng ==== */}
                    <div className={cx('summary-section', 'fade-in', 'fade-delay-2')}>
                        <div className={cx('summary-section__sum')}>
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className={cx('summary-section__details')}>
                                <div className={cx('summary-item')}>
                                    <span>Tổng phụ (đã bao gồm khuyến mãi)</span>
                                    <span>{calcSubtotalAfterPromotion().toLocaleString()}₫</span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>Phí ship</span>
                                    <span>{form.deliveryMethod === 'express' ? '40.000₫' : 'FREE'}</span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>Phí lắp đặt</span>
                                    <span>{installFee > 0 ? `${installFee.toLocaleString()}₫` : 'FREE'}</span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>Thuế</span>
                                    <span>{tax.toLocaleString()}₫</span>
                                </div>
                                <div className={cx('summary-total')}>
                                    <strong>Tổng</strong>
                                    <strong style={{ color: '#e4002b' }}>{total.toLocaleString()}₫</strong>
                                </div>
                            </div>
                        </div>

                        {/* ==== Giỏ hàng chi tiết ==== */}
                        <div className={cx('cart-preview', 'fade-delay-3')}>
                            <h3>Giỏ hàng của bạn ({cartItems.length})</h3>
                            <div className={cx('cart-preview__wrap')}>
                                {cartItems.map((item) => renderCartRow(item))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === Form nhập địa chỉ mới (tách riêng cho gọn) ===
function AddressSelectorForm({ form, onChange, agreed, setAgreed, onSubmit }) {
    const cx = classNames.bind(styles);
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className={cx('form')}
        >
            <div className={cx('form-group', 'row')}>
                <div className={cx('form-field')}>
                    <label>
                        Họ<span>*</span>
                    </label>
                    <input name="firstName" required value={form.firstName} onChange={onChange} />
                </div>
                <div className={cx('form-field')}>
                    <label>
                        Tên<span>*</span>
                    </label>
                    <input name="lastName" required value={form.lastName} onChange={onChange} />
                </div>
            </div>

            <AddressSelector
                value={{ province: form.province, district: form.district, ward: form.ward }}
                onChange={(addr) => onChange({ target: { name: 'province', value: addr.province } })}
            />

            <div className={cx('form-field')}>
                <label>
                    Số nhà / Ngõ / Đường<span>*</span>
                </label>
                <input name="address1" required value={form.address1} onChange={onChange} />
            </div>

            <div className={cx('form-field')}>
                <label>
                    Số điện thoại<span>*</span>
                </label>
                <input name="phone" required value={form.phone} onChange={onChange} />
            </div>

            <div className={cx('form-field')}>
                <label>
                    Email<span>*</span>
                </label>
                <input name="email" type="email" required value={form.email} onChange={onChange} />
            </div>

            <div className={cx('form-field__agree')}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                <label>
                    Tôi đã đọc và đồng ý cho <strong>TECHVN</strong> xử lý thông tin của tôi.
                </label>
            </div>

            <button type="submit" className={cx('submit-btn')}>
                ĐẶT HÀNG NGAY
            </button>
        </form>
    );
}
export default CheckoutPage;
