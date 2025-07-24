import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './PaymentPage.module.scss';
import classNames from 'classnames/bind';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';
import { useToast } from '~/components/ToastMessager/ToastMessager'; // <-- NEW
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import axiosClient from '~/utils/axiosClient';
import cartEvent from '~/utils/cartEvent';

const cx = classNames.bind(styles);

function PaymentPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const showToast = useToast();

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discountCode, setDiscountCode] = useState('');
    const [finalTotal, setFinalTotal] = useState(state?.total || 0);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApplyDiscount = () => {
        if (discountCode === 'CODE') {
            const discount = Math.round(state.total * 0.1); // 10%
            setDiscountAmount(discount);
            const newTotal = Math.round(state.total - discount);
            setFinalTotal(newTotal);
            showToast('Áp dụng mã giảm giá thành công (giảm 10%)', 'success');
        } else {
            setDiscountAmount(0);
            setFinalTotal(state.total);
            showToast('Mã giảm giá không hợp lệ', 'error');
        }
    };

    const handleConfirmPayment = async () => {
        try {
            const res = await axiosClient.post('/orders/checkout', {
                shippingInfo: {
                    name: state.fullName,
                    phone: state.phone,
                    address: state.address,
                },
            });

            cartEvent.emit('update-cart-count'); // 🔔 yêu cầu Header refetch

            console.log('Đơn hàng mới:', res.data);
            showToast('Thanh toán thành công!', 'success', 1200);

            setTimeout(() => {
                navigate('/orders-success');
            }, 1200);
        } catch (err) {
            console.error('Lỗi khi tạo đơn hàng:', err);
            showToast('Không thể tạo đơn hàng', 'error');
        }
    };

    if (!state) return <div className={cx('textCenter')}>Không có dữ liệu đơn hàng</div>;

    return (
        <div className={cx('payment')}>
            <CheckoutStep currentStep={3} />

            <Link to="/checkout">
                <FontAwesomeIcon icon={faAngleLeft} style={{ marginRight: '10px' }} />
                Quay về thông tin đặt hàng
            </Link>

            <div className={cx('wrapper')}>
                <h2>3. THANH TOÁN</h2>

                <div className={cx('wrapper-section')}>
                    <div className={cx('section')}>
                        <h3 className={cx('heading')}>Thông tin đặt hàng</h3>
                        <ul className={cx('list')}>
                            <li>
                                <span className={cx('label')}>Họ tên:</span> {state.fullName}
                            </li>
                            <li>
                                <span className={cx('label')}>Số điện thoại:</span> {state.phone}
                            </li>
                            <li>
                                <span className={cx('label')}>Email:</span> {state.email}
                            </li>
                            <li>
                                <span className={cx('label')}>Địa chỉ:</span> {state.address}
                            </li>
                        </ul>
                    </div>

                    <div className={cx('section')}>
                        <h3>Chi phí</h3>
                        <ul className={cx('list')}>
                            <li>
                                <span className={cx('label')}>Tạm tính:</span>
                                <strong>{state.subtotal.toLocaleString()}₫</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí giao hàng:</span>
                                <strong>{state.deliveryFee ? '40.000₫' : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Phí lắp đặt:</span>
                                <strong>{state.installFee ? '200.000₫' : 'FREE'}</strong>
                            </li>
                            <li>
                                <span className={cx('label')}>Thuế:</span>
                                <strong>{state.tax.toLocaleString()}₫</strong>
                            </li>
                            {discountAmount > 0 && (
                                <li>
                                    <span className={cx('label')}>Mã giảm giá 10%:</span>
                                    <strong>-{discountAmount.toLocaleString()}₫</strong>
                                </li>
                            )}
                        </ul>
                    </div>

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

                <div className={cx('total')}>
                    <p>Tổng tiền:</p>
                    <span>{finalTotal.toLocaleString()}₫</span>
                </div>

                <button onClick={handleConfirmPayment} className={cx('confirmButton')}>
                    Xác nhận thanh toán
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
