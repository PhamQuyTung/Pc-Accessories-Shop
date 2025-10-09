import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './CartPage.module.scss';
import classNames from 'classnames/bind';
import { FaTrashAlt, FaGift } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager';
import EmptyCart from '~/assets/images/emptycart/emptyCart.49efd90ea75b10bede28.png';
import cartEvent from '~/utils/cartEvent';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';

const cx = classNames.bind(styles);

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [removedItems, setRemovedItems] = useState([]);
    const [removedHandled, setRemovedHandled] = useState(false);

    const toast = useToast();

    // === Fetch cart ===
    const fetchCart = async () => {
        try {
            const res = await axiosClient.get('/carts');
            const items = res.data.items || [];
            const removed = res.data.removed || [];

            setCartItems(items);
            setRemovedItems(removed);
            setRemovedHandled(false);

            const initialQuantities = {};
            items.forEach((item) => {
                if (item.product_id?._id) {
                    initialQuantities[item.product_id._id] = item.quantity;
                }
            });
            setQuantities(initialQuantities);

            cartEvent.emit('update-cart-count');
        } catch (err) {
            console.error('❌ Lỗi fetchCart:', err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // === Hiển thị cảnh báo khi có sản phẩm bị xóa ===
    useEffect(() => {
        if (!removedHandled && removedItems.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Một số sản phẩm đã bị thu hồi',
                html: `
                <p>Các sản phẩm sau không còn khả dụng và đã bị xóa khỏi giỏ hàng:</p>
                <ul style="text-align: left;">
                  ${removedItems.map((p) => `<li>${p.name}</li>`).join('')}
                </ul>`,
                confirmButtonText: 'Đã hiểu',
            });
            setRemovedHandled(true);
        }
    }, [removedItems, removedHandled]);

    // === Cập nhật số lượng ===
    const updateQuantity = async (productId, delta) => {
        const currentQty = quantities[productId] || 1;
        const newQuantity = currentQty + delta;
        if (newQuantity < 1) return;

        try {
            await axiosClient.put('/carts/update', {
                product_id: productId,
                quantity: newQuantity,
            });
            setQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
            cartEvent.emit('update-cart-count'); // ✅ cập nhật lại CartCount ngay
            fetchCart(); // ✅ cập nhật lại giỏ hàng
        } catch (error) {
            console.error('❌ Lỗi cập nhật số lượng:', error);
        }
    };

    // === Xóa sản phẩm khỏi giỏ ===
    const removeFromCart = async (productId) => {
        await axiosClient.delete('/carts/remove', {
            data: { product_id: productId },
        });
        toast('Đã xoá sản phẩm khỏi giỏ hàng!', 'success');
        fetchCart();
        cartEvent.emit('update-cart-count');
    };

    // === Tổng tiền ===
    const totalPrice = cartItems.reduce((acc, item) => {
        const product = item.product_id;
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
        const quantity = quantities[product._id] || item.quantity;
        return acc + finalPrice * quantity;
    }, 0);

    // === Giỏ hàng rỗng ===
    if (cartItems.length === 0) {
        return (
            <div className={cx('empty-cart')}>
                <img src={EmptyCart} alt="EmptyCart" />
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
                <CheckoutStep currentStep={1} />

                <div className={cx('header')}>
                    <h3>1. GIỎ HÀNG CỦA BẠN</h3>
                    <p>
                        Có <strong>{cartItems.length}</strong> sản phẩm trong giỏ hàng
                    </p>
                </div>

                <div className={cx('body')}>
                    {/* Bảng sản phẩm */}
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

                            // ✅ Hiển thị quà tặng
                            const gifts = Array.isArray(product.gifts) ? product.gifts : [];

                            return (
                                <div key={item._id} className={cx('row-wrapper')}>
                                    <div className={cx('row')}>
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
                                                <span className={cx('original')}>
                                                    {product.price.toLocaleString()}₫
                                                </span>
                                            )}
                                            <div className={cx('final')}>{finalPrice.toLocaleString()}₫</div>
                                        </div>

                                        <div className={cx('quantity')}>
                                            <button onClick={() => updateQuantity(productId, -1)}>-</button>
                                            <span>{quantity}</span>
                                            <button onClick={() => updateQuantity(productId, 1)}>+</button>
                                        </div>

                                        <div className={cx('subtotal')}>{totalItemPrice.toLocaleString()}₫</div>

                                        <div>
                                            <button className={cx('remove')} onClick={() => removeFromCart(productId)}>
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 🎁 Quà tặng */}
                                    {product.gifts?.length > 0 && (
                                        <div className={cx('gift-list')}>
                                            {product.gifts.map((gift, idx) => (
                                                <div key={idx} className={cx('gift-item')}>
                                                    <FaGift className={cx('gift-icon')} />
                                                    <div className={cx('gift-content')}>
                                                        <div className={cx('gift-title')}>
                                                            Tặng kèm: <strong>{gift.title}</strong>
                                                        </div>

                                                        {/* Danh sách sản phẩm trong gói quà */}
                                                        {Array.isArray(gift.products) && gift.products.length > 0 && (
                                                            <ul className={cx('gift-products')}>
                                                                {gift.products.map((p, i) => (
                                                                    <li key={i}>
                                                                        <Link
                                                                            to={`/products/${p.productId?.slug}`}
                                                                            className={cx('gift-product-name')}
                                                                        >
                                                                            {p.productId?.name}
                                                                        </Link>
                                                                        <span className={cx('gift-qty')}>
                                                                            x{p.quantity * quantity}{' '}
                                                                            {/* ✅ nhân với số lượng chính */}
                                                                        </span>
                                                                        <span className={cx('gift-price')}>
                                                                            trị giá {p.finalPrice?.toLocaleString()}₫
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Tóm tắt đơn hàng */}
                    <div className={cx('summary')}>
                        <div className={cx('summary-wrap')}>
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
                            <Link to="/checkout" className={cx('checkout')}>
                                Tiến hành đặt hàng
                            </Link>
                        </div>

                        <Link to="/">Mua thêm sản phẩm</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
