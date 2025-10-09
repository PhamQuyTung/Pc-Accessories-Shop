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
        installService: 'no', // ✅ mặc định người dùng tự lắp
    });

    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [activeTab, setActiveTab] = useState('select');

    const toast = useToast();
    const navigate = useNavigate();

    const installFee = form.installService === 'yes' ? 200000 : 0;
    const tax = Math.round(subtotal * 0.15);
    const total = subtotal + tax + installFee + (form.deliveryMethod === 'express' ? 40000 : 0);

    // Lấy giỏ hàng
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosClient.get('/carts/');
                console.log('✅ Cấu trúc response object:', res);
                console.log('✅ Lấy giỏ hàng thành công:', res.data);
                console.log('Tổng số sản phẩm:', res.data.items.length);
                console.log('Chi tiết sản phẩm đầu tiên:', res.data.items[0]);

                const items = Array.isArray(res.data.items) ? res.data.items : [];
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

    // Lấy danh sách địa chỉ từ DB
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axiosClient.get('/addresses');
                setSavedAddresses(res.data || []);
                const defaultAddress = res.data?.find((addr) => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress._id);
                }
            } catch (error) {
                console.error('Lỗi khi lấy địa chỉ:', error);
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

        const shippingInfo = {
            ...form,
            fullName: address.firstName + ' ' + address.lastName,
            phone: address.phone,
            email: address.email,
            address: `${address.detail}, ${address.ward}, ${address.district}, ${address.city}, ${address.postalCode}`,
            subtotal,
            tax,
            deliveryFee: form.deliveryMethod === 'express' ? 40000 : 0,
            installFee,
            total,
        };

        const payload = {
            ...shippingInfo,
            products: cartItems,
        };

        sessionStorage.setItem('checkoutData', JSON.stringify(payload));

        navigate('/payment', {
            state: payload,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) {
            setSubmitted(true);
            return;
        }

        try {
            const payload = {
                shippingInfo: {
                    fullName: form.firstName + ' ' + form.lastName,
                    address: `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.ward}, ${form.district}, ${form.province}, ${form.postalCode}`,
                    phone: form.phone,
                    email: form.email,
                },
                paymentMethod: 'cod', // ví dụ
                tax,
                shippingFee: form.deliveryMethod === 'express' ? 40000 : 0,
                serviceFee: installFee,
                discount: 0,
            };

            const res = await axiosClient.post('/orders/checkout', payload);

            toast.success('Đặt hàng thành công!');
            navigate('/payment', { state: res.data.order });
        } catch (err) {
            if (err.response?.status === 400) {
                const data = err.response.data;

                // Nếu có thông tin sản phẩm hết hàng
                if (data.product && data.requested && data.available !== undefined) {
                    toast.error(`❌ ${data.product}: bạn đặt ${data.requested}, nhưng chỉ còn ${data.available}.`);
                } else {
                    // Các lỗi khác từ server (ví dụ EMPTY_CART, INVALID_CART_ITEMS,...)
                    toast.error(data.message || 'Đơn hàng không hợp lệ!');
                }
            } else {
                toast.error('🚨 Lỗi server, vui lòng thử lại sau!');
            }
        }
    };

    return (
        <div className={cx('checkout')}>
            {/* CheckOut Step List */}
            <CheckoutStep currentStep={2} />

            <div className={cx('checkout-content')}>
                <Link to="/carts">
                    <FontAwesomeIcon icon={faAngleLeft} style={{ marginRight: '10px' }} />
                    Trở về
                </Link>

                {/* CheckOut Container */}
                <div className={cx('checkout-container')}>
                    <div className={cx('form-section')}>
                        <h2>2. VẬN CHUYỂN</h2>

                        <div className={cx('form-section__wrap')}>
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
                                        onSelect={(id) => setSelectedAddressId(id)}
                                        onOrder={handleOrder}
                                    />
                                ) : (
                                    <form onSubmit={handleSubmit} className={cx('form')}>
                                        {/* Form nhập địa chỉ mới */}
                                        <div className={cx('form-group', 'row')}>
                                            <div className={cx('form-field')}>
                                                <label htmlFor="firstName">
                                                    Họ<span>*</span>
                                                </label>
                                                <input
                                                    id="firstName"
                                                    name="firstName"
                                                    required
                                                    value={form.firstName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className={cx('form-field')}>
                                                <label htmlFor="lastName">
                                                    Tên<span>*</span>
                                                </label>
                                                <input
                                                    id="lastName"
                                                    name="lastName"
                                                    required
                                                    value={form.lastName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className={cx('form-field')}>
                                            <label htmlFor="postalCode">
                                                Mã bưu điện<span>*</span>
                                            </label>
                                            <input
                                                id="postalCode"
                                                name="postalCode"
                                                required
                                                value={form.postalCode}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <AddressSelector
                                            value={{
                                                province: form.province,
                                                district: form.district,
                                                ward: form.ward,
                                            }}
                                            onChange={(addr) => setForm((prev) => ({ ...prev, ...addr }))}
                                        />

                                        <div className={cx('form-field')}>
                                            <label htmlFor="address1">
                                                Số nhà / Ngõ / Đường<span>*</span>
                                            </label>
                                            <input
                                                id="address1"
                                                name="address1"
                                                required
                                                value={form.address1}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className={cx('form-field')}>
                                            <label htmlFor="phone">
                                                Số điện thoại<span>*</span>
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                required
                                                value={form.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className={cx('form-field')}>
                                            <label htmlFor="email">
                                                Email<span>*</span>
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                value={form.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className={cx('form-field__agree', 'checkboxContainer')}>
                                            <input
                                                type="checkbox"
                                                id="agreeCheckbox"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                required
                                            />
                                            <label htmlFor="agreeCheckbox">
                                                Tôi đã đọc và đồng ý cho <strong>TECHVN</strong> xử lý thông tin của tôi
                                                theo
                                                <a
                                                    className={cx('form-field__agree--link')}
                                                    href="/privacy"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Tuyên bố quyền riêng tư
                                                </a>
                                                và
                                                <a
                                                    className={cx('form-field__agree--link')}
                                                    href="/cookies"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Chính sách cookie
                                                </a>
                                                .
                                            </label>
                                        </div>

                                        <button type="submit" className={cx('submit-btn')}>
                                            ĐẶT HÀNG NGAY
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* UI chọn phương thức giao hàng và dịch vụ lắp đặt tại đây */}
                            {/** BẮT ĐẦU THÊM */}
                            <div className={cx('form-field')}>
                                <label>Phương thức giao hàng:</label>
                                <div className={cx('radio-group')}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="standard"
                                            checked={form.deliveryMethod === 'standard'}
                                            onChange={handleChange}
                                        />
                                        Giao tiêu chuẩn (FREE)
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="express"
                                            checked={form.deliveryMethod === 'express'}
                                            onChange={handleChange}
                                        />
                                        Giao nhanh (40.000₫)
                                    </label>
                                </div>
                            </div>

                            <div className={cx('form-field')}>
                                <label>Dịch vụ lắp đặt:</label>
                                <div className={cx('radio-group')}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="installService"
                                            value="no"
                                            checked={form.installService === 'no'}
                                            onChange={handleChange}
                                        />
                                        Tự lắp đặt (FREE)
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="installService"
                                            value="yes"
                                            checked={form.installService === 'yes'}
                                            onChange={handleChange}
                                        />
                                        Nhờ TECHVN lắp đặt (200.000₫)
                                    </label>
                                </div>
                            </div>
                            {/** KẾT THÚC THÊM */}
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

                        <div className={cx('cart-preview')}>
                            <h3>Giỏ hàng của bạn ({cartItems.length})</h3>
                            <div className={cx('cart-preview__wrap')}>
                                {cartItems.map((item) => {
                                    const product = item.product_id;
                                    const gifts = Array.isArray(product.gifts) ? product.gifts : [];

                                    return (
                                        <div className={cx('cart-item')} key={item._id}>
                                            <img
                                                src={Array.isArray(product.images) ? product.images[0] : product.images}
                                                alt={product.name}
                                            />
                                            <div className={cx('cart-item__info')}>
                                                <p className={cx('cart-item__name')}>{product.name}</p>
                                                <p className={cx('cart-item__qty')}>SL: {item.quantity}</p>
                                                <strong className={cx('cart-item__price')}>
                                                    {(product.discountPrice > 0
                                                        ? product.discountPrice
                                                        : product.price
                                                    ).toLocaleString()}
                                                    ₫
                                                </strong>

                                                {/* ✅ Hiển thị quà tặng nếu có */}
                                                {product.gifts?.length > 0 && (
                                                    <div className={cx('gift-list')}>
                                                        <p className={cx('gift-title')}>🎁 Quà tặng kèm:</p>
                                                        <ul className={cx('gift-items')}>
                                                            {product.gifts.map((gift, gIdx) => (
                                                                <li key={gIdx} className={cx('gift-group')}>
                                                                    <strong>{gift.title}</strong>
                                                                    <ul>
                                                                        {gift.products.map((gItem, i) => (
                                                                            <li key={i} className={cx('gift-item')}>
                                                                                <span>{gItem.productId.name}</span>
                                                                                <span>x{gItem.quantity * item.quantity}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
