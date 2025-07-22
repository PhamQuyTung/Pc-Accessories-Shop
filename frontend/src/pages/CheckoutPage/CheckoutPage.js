import React, { useState, useEffect } from 'react';
import styles from './CheckoutPage.module.scss';
import classNames from 'classnames/bind';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';
import axiosClient from '~/utils/axiosClient';

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
        phone: '',
        email: '',
        deliveryMethod: 'standard',
    });
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosClient.get('/carts/');
                const items = Array.isArray(res.data) ? res.data : [];
                setCartItems(items);

                const total = items.reduce((acc, item) => {
                    const price =
                        item.product_id.discountPrice > 0 ? item.product_id.discountPrice : item.product_id.price;
                    return acc + price * item.quantity;
                }, 0);

                setSubtotal(total);
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
            }
        };

        fetchCart();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const shippingInfo = {
            name: form.firstName + ' ' + form.lastName,
            phone: form.phone,
            address:
                form.address1 +
                (form.address2 ? ', ' + form.address2 : '') +
                ', ' +
                form.city +
                ', ' +
                form.province +
                ', ' +
                form.postalCode,
        };

        if (!agreed) return; // Không cho submit nếu chưa đồng ý

        // ✅ Gọi API đặt hàng tại đây
        try {
            await axiosClient.post('/orders/checkout', { shippingInfo });
            toast('🛒 Đặt hàng thành công!', 'success');
            navigate('/orders');
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            toast('Đặt hàng thất bại!', 'error');
        }
    };

    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    return (
        <div className={cx('checkout')}>
            <div className={cx('checkout-container')}>
                <div className={cx('form-section')}>
                    <h2>1. VẬN CHUYỂN</h2>

                    <div className={cx('form-section__wrap')}>
                        <form onSubmit={handleSubmit} className={cx('form')}>
                            <div className={cx('row')}>
                                <input name="firstName" placeholder="First Name*" required onChange={handleChange} />
                                <input name="lastName" placeholder="Last Name*" required onChange={handleChange} />
                            </div>

                            <input name="postalCode" placeholder="Postal Code*" required onChange={handleChange} />
                            <input name="address1" placeholder="Address Line 1*" required onChange={handleChange} />
                            <input name="address2" placeholder="Address Line 2 (Optional)" onChange={handleChange} />
                            <input name="city" placeholder="Municipality*" required onChange={handleChange} />
                            <select name="province" required onChange={handleChange}>
                                <option value="">Select a province</option>
                                <option value="Ha Noi">Hà Nội</option>
                                <option value="Ho Chi Minh">Hồ Chí Minh</option>
                                <option value="Da Nang">Đà Nẵng</option>
                            </select>

                            <input name="phone" placeholder="Shipping Phone*" required onChange={handleChange} />
                            <input name="email" type="email" placeholder="Email*" required onChange={handleChange} />

                            <div className={cx('delivery-method')}>
                                <label>
                                    <input
                                        type="radio"
                                        name="deliveryMethod"
                                        value="standard"
                                        defaultChecked
                                        onChange={handleChange}
                                    />
                                    Standard FREE
                                </label>
                                <label>
                                    <input type="radio" name="deliveryMethod" value="express" onChange={handleChange} />
                                    Express +40.000₫
                                </label>
                            </div>

                            <div className={cx('checkboxContainer')}>
                                <input
                                    type="checkbox"
                                    id="agreeCheckbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    required
                                />
                                <label htmlFor="agreeCheckbox">
                                    Tôi đã đọc và đồng ý cho <strong>TECHVN</strong> xử lý thông tin của tôi theo
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                        Tuyên bố quyền riêng tư
                                    </a>
                                    và
                                    <a href="/cookies" target="_blank" rel="noopener noreferrer">
                                        Chính sách cookie
                                    </a>
                                    . TECHVN là đối tác đáng tin cậy.
                                </label>
                            </div>

                            {submitted && !agreed && (
                                <div className={cx('errorText')}>You must agree before proceeding.</div>
                            )}

                            <button type="submit" disabled={!agreed} className={cx('submit-btn')}>
                                TIẾP TỤC THANH TOÁN
                            </button>
                        </form>
                    </div>
                </div>

                <div className={cx('summary-section')}>
                    <div className={cx('summary-section__sum')}>
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className={cx('summary-section__details')}>
                            <div className={cx('summary-item')}>
                                <span>Tổng phụ</span>
                                <span>{subtotal.toLocaleString()}₫</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <span>Phí ship</span>
                                <span>{form.deliveryMethod === 'express' ? '40.000₫' : 'FREE'}</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <span>Thuế</span>
                                <span>{tax.toLocaleString()}₫</span>
                            </div>
                            <div className={cx('summary-total')}>
                                <strong>Tổng</strong>
                                <strong style={{ color: '#e4002b' }}>
                                    {(form.deliveryMethod === 'express' ? total + 40000 : total).toLocaleString()}₫
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className={cx('cart-preview')}>
                        <h3>Giỏ hàng của bạn ({cartItems.length})</h3>
                        <div className={cx('cart-preview__wrap')}>
                            {cartItems.map((item) => (
                                <div className={cx('cart-item')} key={item._id}>
                                    <img
                                        src={
                                            Array.isArray(item.product_id.images)
                                                ? item.product_id.images[0]
                                                : item.product_id.images
                                        }
                                        alt={item.product_id.name}
                                    />
                                    <div>
                                        <p>{item.product_id.name}</p>
                                        <p>SL: {item.quantity}</p>
                                        <strong>
                                            {(item.product_id.discountPrice > 0
                                                ? item.product_id.discountPrice
                                                : item.product_id.price
                                            ).toLocaleString()}
                                            ₫
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/carts">Edit Cart</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
