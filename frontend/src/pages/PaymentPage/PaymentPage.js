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

    const state = location.state || JSON.parse(sessionStorage.getItem('checkoutData'));

    const shippingInfo = state?.shippingInfo || {};
    const products = state?.products || [];

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(shippingInfo.total || 0);
    const [promotionSummary, setPromotionSummary] = useState({ totalDiscount: 0, discounts: [] });

    // ✅ Lưu checkoutData vào session để F5 không mất dữ liệu
    if (location.state) {
        sessionStorage.setItem('checkoutData', JSON.stringify(location.state));
    }

    // ✅ Lấy danh sách khuyến mãi từ API
    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                if (!products.length) return;
                const response = await axiosClient.post('/promotion-gifts/apply-cart', {
                    cartItems: products.map((item) => ({
                        product_id: item.product_id._id,
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

    // === Áp dụng mã giảm giá ===
    const handleApplyDiscount = () => {
        if (discountCode === 'CODE') {
            const discount = Math.round(shippingInfo.total * 0.1);
            setDiscountAmount(discount);
            setFinalTotal(Math.round(shippingInfo.total - discount));
            showToast('Áp dụng mã giảm giá thành công (giảm 10%)', 'success');
        } else {
            setDiscountAmount(0);
            setFinalTotal(shippingInfo.total);
            showToast('Mã giảm giá không hợp lệ', 'error');
        }
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
                subtotal: shippingInfo.subtotal,
                tax: shippingInfo.tax,
                shippingFee: shippingInfo.deliveryFee ? 40000 : 0,
                serviceFee: shippingInfo.installFee ? 200000 : 0,
                discount: discountAmount + (promotionSummary.totalDiscount || 0),
                total: finalTotal - (promotionSummary.totalDiscount || 0),
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

    // === Render danh sách sản phẩm + quà tặng (đồng bộ từ CheckoutPage) ===
    const renderProduct = (item) => {
        const product = item.product_id;
        const price = product.discountPrice > 0 ? product.discountPrice : product.price;
        const total = price * item.quantity;

        // Tìm khuyến mãi tương ứng
        const promo = promotionSummary.discounts.find((d) => d.productId === product._id);

        return (
            <li key={item._id} className={cx('productItem')}>
                <img
                    src={Array.isArray(product.images) ? product.images[0] : product.images}
                    alt={product.name}
                    className={cx('productImage')}
                />
                <div className={cx('productInfo')}>
                    <p className={cx('productName')}>{product.name}</p>
                    <p className={cx('productDetail')}>Số lượng: {item.quantity}</p>
                    <p className={cx('productDetail')}>
                        Giá: {price.toLocaleString()}₫ × {item.quantity}
                    </p>
                    <p className={cx('productTotal')}>Thành tiền: {total.toLocaleString()}₫</p>

                    {/* === Quà tặng từ product.gifts === */}
                    {product.gifts?.length > 0 && (
                        <div className={cx('giftList')}>
                            <ul>
                                {product.gifts.map((gift, gIdx) => (
                                    <li key={gIdx} className={cx('giftGroup')}>
                                        <p className={cx('giftTitle')}>🎁 {gift.title}:</p>
                                        <ul>
                                            {gift.products.map((gItem, i) => (
                                                <li key={i} className={cx('giftItem')}>
                                                    <span>{gItem.productId?.name}</span>
                                                    <span>x{gItem.quantity * item.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* === Khuyến mãi áp dụng === */}
                    {promo && (
                        <div className={cx('promotionTag')}>
                            <span>🔥 {promo.promotionTitle}</span>
                            <span>-{promo.discountPerItem?.toLocaleString()}₫/sp</span>
                        </div>
                    )}
                </div>
            </li>
        );
    };

    // === Tổng hợp chi phí ===
    const promoDiscount = promotionSummary.totalDiscount || 0;
    const totalWithPromo = finalTotal - promoDiscount;

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
                                <strong>{shippingInfo.subtotal?.toLocaleString() || 0}₫</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí giao hàng:</span>
                                <strong>{shippingInfo.deliveryFee ? '40.000₫' : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí lắp đặt:</span>
                                <strong>{shippingInfo.installFee ? '200.000₫' : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Thuế:</span>
                                <strong>{shippingInfo.tax?.toLocaleString() || 0}₫</strong>
                            </li>
                            {promoDiscount > 0 && (
                                <li>
                                    <span className={cx('label')}>Khuyến mãi:</span>
                                    <strong>-{promoDiscount.toLocaleString()}₫</strong>
                                </li>
                            )}
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
                    <span>{totalWithPromo.toLocaleString()}₫</span>
                </div>

                <button onClick={handleConfirmPayment} className={cx('confirmButton')}>
                    Xác nhận thanh toán
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
