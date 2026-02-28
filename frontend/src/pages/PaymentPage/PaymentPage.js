import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './PaymentPage.module.scss';
import classNames from 'classnames/bind';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import axiosClient from '~/utils/axiosClient';
import cartEvent from '~/utils/cartEvent';

const cx = classNames.bind(styles);

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const showToast = useToast();

    // === Nhận state từ CheckoutPage hoặc session ===
    const state = location.state || JSON.parse(sessionStorage.getItem('checkoutData'));
    const shippingInfo = state?.shippingInfo || {};
    const products = state?.products || [];

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promotionSummary, setPromotionSummary] = useState({ totalDiscount: 0, discounts: [] });

    // ✅ Lưu lại session để F5 không mất dữ liệu
    if (location.state) {
        sessionStorage.setItem('checkoutData', JSON.stringify(location.state));
    }

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

    // ✅ Lấy danh sách khuyến mãi từ API
    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                if (!products.length) return;
                const response = await axiosClient.post('/promotion-gifts/apply-cart', {
                    cartItems: products.map((item) => ({
                        product_id: item.product_id._id,
                        variation_id: item.variation_id?._id || null,
                        quantity: item.quantity,
                        createdAt: item.createdAt,
                    })),
                });
                setPromotionSummary(response.data || { totalDiscount: 0, discounts: [] });
            } catch (error) {
                console.error('Lỗi lấy khuyến mãi:', error);
            }
        };
        fetchPromotion();
    }, [products]);

    if (!state) {
        return (
            <div className={cx('textCenter')}>
                Không tìm thấy đơn hàng, vui lòng quay lại <Link to="/cart">giỏ hàng</Link>.
            </div>
        );
    }

    // === Tính tạm tính sau khuyến mãi ===
    const calcSubtotalAfterPromotion = () => {
        return products.reduce((sum, item) => {
            // Skip gift items — they are free and shouldn't count towards subtotal
            if (item.isGift) return sum;

            const product = item.product_id;
            const variation = item.variation_id || null;
            const { basePrice } = getPriceData(product, variation);
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

    const subtotal = calcSubtotalAfterPromotion();
    const deliveryFee = shippingInfo.deliveryFee ? 40000 : 0;
    const installFee = shippingInfo.installFee ? 200000 : 0;
    // Recompute tax from the subtotal after promotions to avoid mismatch
    // (shippingInfo.tax may have been calculated earlier and become inconsistent)
    const promoDiscount = promotionSummary.totalDiscount || 0;
    const tax = Math.round(subtotal * 0.15) || 0;

    // === Áp dụng mã giảm giá (giảm 10%) ===
    const handleApplyDiscount = () => {
        if (discountCode.trim().toUpperCase() === 'CODE') {
            const discount = Math.round(subtotal * 0.1);
            setDiscountAmount(discount);
            showToast('Áp dụng mã giảm giá thành công (giảm 10%)', 'success');
        } else {
            setDiscountAmount(0);
            showToast('Mã giảm giá không hợp lệ', 'error');
        }
    };

    // === Tổng cuối cùng ===
    const totalFinal = subtotal + deliveryFee + installFee + tax - discountAmount;

    // === Render từng sản phẩm (UPDATE) ===
    const renderProduct = (item) => {
        const product = item.product_id;
        const variation = item.variation_id || null;
        const productId = product._id;
        const { basePrice } = getPriceData(product, variation);
        const imageSrc = variation?.images?.[0] || product.images?.[0];
        const variationLabel = getVariationLabel(variation);
        const promoItem = promotionSummary.discounts.find((d) => d.productId === productId);
        const rows = [];

        // If this cart item is a gift (admin-added), render it as a free gift with description
        if (item.isGift) {
            const parentName = item.parentProductId?.name || item.parentProductId || 'sản phẩm chính';
            const parentSlug = item.parentProductId?.slug;

            rows.push(
                <li key={`gift-${productId}`} className={cx('productItem')}>
                    <img
                        src={
                            imageSrc ||
                            (Array.isArray(product.images) ? product.images[0] : product.images) ||
                            '/placeholder.png'
                        }
                        alt={product.name}
                        className={cx('productImage')}
                    />
                    <div className={cx('productInfo')}>
                        <p className={cx('productName')}>{product.name}</p>
                        {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                        <p className={cx('productDetail')}>Số lượng: {item.quantity}</p>
                        <div className={cx('giftList')}>
                            <div className={cx('giftTitle')}>🎁 Quà tặng miễn phí khi mua{' '}
                                {parentSlug ? (
                                    <Link to={`/product/${parentSlug}`}>{parentName}</Link>
                                ) : (
                                    parentName
                                )}
                            </div>
                        </div>
                        <p className={cx('productTotal')}>Thành tiền: {(0).toLocaleString()}₫</p>
                    </div>
                </li>,
            );

            return rows;
        }

        if (promoItem) {
            if (promoItem.discountedQty > 0) {
                const discountedPrice = basePrice - promoItem.discountPerItem;
                rows.push(
                    <li key={`${productId}-promo`} className={cx('productItem', 'promoRow')}>
                        <img
                            src={
                                imageSrc ||
                                (Array.isArray(product.images) ? product.images[0] : product.images) ||
                                '/placeholder.png'
                            }
                            alt={product.name}
                            className={cx('productImage')}
                        />
                        <div className={cx('productInfo')}>
                            <p className={cx('productName')}>{product.name}</p>
                            {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                            <div className={cx('promotionTag')}>🎁 {promoItem.promotionTitle}</div>
                            <p className={cx('productDetail')}>Số lượng: {promoItem.discountedQty}</p>
                            <p className={cx('productDetail')}>
                                Giá sau giảm: {discountedPrice.toLocaleString()}₫ × {promoItem.discountedQty}
                            </p>
                            <p className={cx('productTotal')}>
                                Thành tiền: {(discountedPrice * promoItem.discountedQty).toLocaleString()}₫
                            </p>
                        </div>
                    </li>,
                );
            }

            if (promoItem.normalQty > 0) {
                rows.push(
                    <li key={`${productId}-normal`} className={cx('productItem')}>
                        <img
                            src={
                                imageSrc ||
                                (Array.isArray(product.images) ? product.images[0] : product.images) ||
                                '/placeholder.png'
                            }
                            alt={product.name}
                            className={cx('productImage')}
                        />
                        <div className={cx('productInfo')}>
                            <p className={cx('productName')}>{product.name}</p>
                            {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                            <p className={cx('productDetail')}>Số lượng: {promoItem.normalQty}</p>
                            <p className={cx('productDetail')}>
                                Giá: {basePrice.toLocaleString()}₫ × {promoItem.normalQty}
                            </p>
                            <p className={cx('productTotal')}>
                                Thành tiền: {(basePrice * promoItem.normalQty).toLocaleString()}₫
                            </p>
                        </div>
                    </li>,
                );
            }
        } else {
            rows.push(
                <li key={productId} className={cx('productItem')}>
                    <img
                        src={
                            imageSrc ||
                            (Array.isArray(product.images) ? product.images[0] : product.images) ||
                            '/placeholder.png'
                        }
                        alt={product.name}
                        className={cx('productImage')}
                    />
                    <div className={cx('productInfo')}>
                        <p className={cx('productName')}>{product.name}</p>
                        {variationLabel && <div className={cx('variation-label')}>{variationLabel}</div>}
                        <p className={cx('productDetail')}>Số lượng: {item.quantity}</p>
                        <p className={cx('productDetail')}>
                            Giá: {basePrice.toLocaleString()}₫ × {item.quantity}
                        </p>
                        <p className={cx('productTotal')}>
                            Thành tiền: {(basePrice * item.quantity).toLocaleString()}₫
                        </p>
                    </div>
                </li>,
            );
        }

        return rows;
    };

    // === Xác nhận thanh toán ===
    const handleConfirmPayment = async () => {
        try {
            await axiosClient.post('/orders/checkout', {
                shippingInfo: {
                    name: shippingInfo.fullName,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                },
                subtotal,
                tax,
                shippingFee: deliveryFee,
                serviceFee: installFee,
                discount: discountAmount + promoDiscount,
                total: totalFinal,
                paymentMethod,
            });

            cartEvent.emit('update-cart-count');
            showToast('Thanh toán thành công!', 'success', 1200);
            setTimeout(() => navigate('/orders-success'), 1200);
        } catch (err) {
            console.error('Lỗi khi tạo đơn hàng:', err);
            const message = err.response?.data?.message || '🚨 Lỗi server, vui lòng thử lại sau!';
            showToast(message, 'error');
        }
    };

    return (
        <div className={cx('payment')}>
            <CheckoutStep currentStep={3} />

            <Link to="/checkout" className={cx('backLink')}>
                <FontAwesomeIcon icon={faAngleLeft} style={{ marginRight: '10px' }} />
                Quay về thông tin đặt hàng
            </Link>

            <div className={cx('wrapper')}>
                <h2>3. THANH TOÁN</h2>

                <div className={cx('wrapper-section')}>
                    {/* === Danh sách sản phẩm === */}
                    <div className={cx('section')}>
                        <h3 className={cx('heading')}>Thông tin sản phẩm</h3>
                        <ul className={cx('productList')}>
                            {products.length > 0 ? products.map(renderProduct) : <p>Không có sản phẩm nào.</p>}
                        </ul>
                    </div>

                    {/* === Chi phí === */}
                    <div className={cx('section')}>
                        <h3>Chi phí</h3>
                        <ul className={cx('list')}>
                            <li>
                                <span className={cx('label')}>Tạm tính:</span>
                                <strong>{subtotal.toLocaleString()}₫</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí giao hàng:</span>
                                <strong>{deliveryFee ? `${deliveryFee.toLocaleString()}₫` : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí lắp đặt:</span>
                                <strong>{installFee ? `${installFee.toLocaleString()}₫` : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Thuế:</span>
                                <strong>{tax.toLocaleString()}₫</strong>
                            </li>
                            {discountAmount > 0 && (
                                <li>
                                    <span className={cx('label')}>Mã giảm giá 10%:</span>
                                    <strong>-{discountAmount.toLocaleString()}₫</strong>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* === Mã giảm giá === */}
                    <div className={cx('section')}>
                        <h3 className={cx('label')}>Mã giảm giá</h3>
                        <div className={cx('inputGroup')}>
                            <input
                                type="text"
                                className={cx('input')}
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="Nhập mã giảm giá"
                            />
                            <button onClick={handleApplyDiscount} className={cx('button')}>
                                Áp dụng
                            </button>
                        </div>
                    </div>

                    {/* === Phương thức thanh toán === */}
                    <div className={cx('section')}>
                        <h3 className={cx('label')}>Phương thức thanh toán</h3>
                        <div className={cx('radioGroup')}>
                            <label className={cx('radioLabel')}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <span>Thanh toán khi giao hàng (COD)</span>
                            </label>
                            <label className={cx('radioLabel')}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="bank"
                                    checked={paymentMethod === 'bank'}
                                    onChange={() => setPaymentMethod('bank')}
                                />
                                <span>Chuyển khoản ngân hàng</span>
                            </label>
                        </div>

                        {paymentMethod === 'bank' && (
                            <div className={cx('bankInfo')}>
                                <p className={cx('label')}>Ngân hàng hỗ trợ:</p>
                                <ul>
                                    <li>MB Bank: 12345678 - PHAM VAN A</li>
                                    <li>VietinBank: 23456789 - PHAM VAN A</li>
                                    <li>Shinhan Bank: 34567890 - PHAM VAN A</li>
                                    <li>Sacombank: 45678901 - PHAM VAN A</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* === Tổng tiền cuối === */}
                <div className={cx('total')}>
                    <p>Tổng tiền:</p>
                    <span>{totalFinal.toLocaleString()}₫</span>
                </div>

                <button onClick={handleConfirmPayment} className={cx('confirmButton')}>
                    Xác nhận thanh toán
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
