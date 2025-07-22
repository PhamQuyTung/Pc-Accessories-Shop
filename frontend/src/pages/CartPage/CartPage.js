import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './CartPage.module.scss';
import classNames from 'classnames/bind';
import { FaTrashAlt } from 'react-icons/fa';
import { useToast } from '~/components/ToastMessager';
import EmptyCart from '~/assets/images/emptycart/emptyCart.49efd90ea75b10bede28.png';
import cartEvent from '~/utils/cartEvent';

const cx = classNames.bind(styles);

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});

    const toast = useToast();

    const fetchCart = async () => {
        try {
            const res = await axiosClient.get('/carts/');
            const items = Array.isArray(res.data) ? res.data : [];
            setCartItems(items);

            const quantitiesMap = {};
            items.forEach((item) => {
                quantitiesMap[item.product_id._id] = item.quantity;
            });
            setQuantities(quantitiesMap);
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId, delta) => {
        const currentQty = quantities[productId] || 1;
        const newQuantity = currentQty + delta;
        if (newQuantity < 1) return;

        // Cập nhật UI trước
        setQuantities((prev) => ({
            ...prev,
            [productId]: newQuantity,
        }));

        // Gọi API cập nhật số lượng mới
        try {
            await axiosClient.put('/carts/update', {
                product_id: productId,
                quantity: newQuantity,
            });
        } catch (error) {
            console.error('Lỗi cập nhật số lượng:', error);
        }
    };

    const removeFromCart = async (productId) => {
        await axiosClient.delete('/carts/remove', {
            data: { product_id: productId },
        });
        toast('Đã xoá sản phẩm khỏi giỏ hàng!', 'success');
        fetchCart();
        cartEvent.emit('update-cart-count'); // 🔔 Gửi tín hiệu update count
    };

    const totalPrice = cartItems.reduce((acc, item) => {
        const product = item.product_id;
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
        const quantity = quantities[product._id] || item.quantity;
        return acc + finalPrice * quantity;
    }, 0);

    // const handleCheckout = async () => {
    //     try {
    //         const shippingInfo = {
    //             name: 'Nguyễn Văn A', // Tuỳ bạn: Có thể làm form nhập
    //             phone: '0123456789',
    //             address: 'Số 123, Hà Nội',
    //         };

    //         const res = await axiosClient.post('/orders/checkout', { shippingInfo });
    //         toast('🛒 Đặt hàng thành công!', 'success');

    //         // Xoá giỏ hàng local
    //         setCartItems([]);
    //         cartEvent.emit('update-cart-count');
    //     } catch (error) {
    //         console.error('❌ Lỗi đặt hàng:', error);
    //         toast('Đặt hàng thất bại!', 'error');
    //     }
    // };

    if (cartItems.length === 0) {
        return (
            <div className={cx('empty-cart')}>
                <img src={EmptyCart} alt="EmptyCart"></img>
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy khám phá thêm các sản phẩm hấp dẫn nhé!</p>
                <a href="/" className={cx('go-home-btn')}>
                    Mua sắm ngay
                </a>
            </div>
        );
    }

    return (
        <div className={cx('cart')}>
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <h2>GIỎ HÀNG CỦA BẠN</h2>
                    <p>
                        Có <strong>{cartItems.length}</strong> sản phẩm trong giỏ hàng
                    </p>
                </div>

                <div className={cx('body')}>
                    <div className={cx('table')}>
                        <div className={cx('header')}>
                            <div>Sản phẩm</div>
                            <div>Giá</div>
                            <div>Số lượng</div>
                            <div>Thành tiền</div>
                            <div>Xóa</div>
                        </div>

                        {cartItems.map((item) => {
                            const product = item.product_id;
                            const productId = product._id;
                            const quantity = quantities[productId] || item.quantity;
                            const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
                            const totalItemPrice = finalPrice * quantity;

                            return (
                                <div className={cx('row')} key={item._id}>
                                    <div className={cx('product')}>
                                        <img
                                            src={Array.isArray(product.images) ? product.images[0] : product.images}
                                            alt={product.name}
                                        />
                                        <Link to={`/products/${product.slug}`} className={cx('product-name')}>
                                            {product.name}
                                        </Link>
                                    </div>

                                    <div className={cx('price')}>
                                        {product.discountPrice > 0 && product.discountPrice < product.price && (
                                            <span className={cx('original')}>{product.price.toLocaleString()}₫</span>
                                        )}
                                        <div className={cx('final')}>{finalPrice.toLocaleString()}₫</div>
                                    </div>

                                    <div className={cx('quantity')}>
                                        <button onClick={() => updateQuantity(productId, -1)}>-</button>
                                        <span>{quantities[productId]}</span>
                                        <button onClick={() => updateQuantity(productId, 1)}>+</button>
                                    </div>

                                    <div className={cx('subtotal')}>{totalItemPrice.toLocaleString()}₫</div>

                                    <div>
                                        <button className={cx('remove')} onClick={() => removeFromCart(productId)}>
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={cx('summary')}>
                        <h3>Thông tin đơn hàng</h3>
                        <div className={cx('summary-item')}>
                            <span>Tạm tính</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>
                        <div className={cx('summary-item')}>
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className={cx('summary-item')}>
                            <span>Khuyến mãi</span>
                            <span>- 0₫</span>
                        </div>
                        <div className={cx('total')}>
                            <span>Tổng thanh toán</span>
                            <strong>{totalPrice.toLocaleString()}₫</strong>
                        </div>
                        <button className={cx('checkout')}>
                            <Link to='/checkout'>Tiến hành đặt hàng</Link>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
