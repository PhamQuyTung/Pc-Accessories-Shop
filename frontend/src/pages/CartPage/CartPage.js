import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import styles from './CartPage.module.scss';
import classNames from 'classnames/bind';
import { FaTrashAlt } from 'react-icons/fa';
import { useToast } from '~/components/ToastMessager';

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
        try {
            await axiosClient.delete('/carts/remove', {
                data: { product_id: productId },
            });
            toast('Đã xoá sản phẩm khỏi giỏ hàng!', 'success');
            fetchCart();
        } catch (error) {
            console.error('Lỗi xoá sản phẩm:', error);
            toast('Xoá sản phẩm thất bại!', 'error');
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => {
        const product = item.product_id;
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
        const quantity = quantities[product._id] || item.quantity;
        return acc + finalPrice * quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className={cx('empty-cart')}>
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
                                        <span>{product.name}</span>
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
                        <h3>Tổng cộng</h3>
                        <p>{totalPrice.toLocaleString()}₫</p>
                        <button className={cx('checkout')}>Thanh toán</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
