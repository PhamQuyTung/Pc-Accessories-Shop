import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './CartPage.module.scss';
import classNames from 'classnames/bind';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager';
import EmptyCart from '~/assets/images/emptycart/emptyCart.49efd90ea75b10bede28.png';
import cartEvent from '~/utils/cartEvent';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';

const cx = classNames.bind(styles);

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [total, setTotal] = useState(0);
    const [removedItems, setRemovedItems] = useState([]);
    const [removedHandled, setRemovedHandled] = useState(false); // ✅ chặn thông báo nhiều lần

    const toast = useToast();

    const fetchCart = async () => {
        try {
            const res = await axiosClient.get('/carts');
            const items = res.data.items || [];
            const removed = res.data.removed || [];

            console.log('✅ items:', items);
            console.log('⚠️ removed:', removed);

            setCartItems(items);
            setRemovedItems(removed);
            setRemovedHandled(false);

            // 🟢 Khởi tạo quantities theo API (fix bug phải bấm + mới set)
            const initialQuantities = {};
            items.forEach((item) => {
                if (item.product_id?._id) {
                    initialQuantities[item.product_id._id] = item.quantity;
                }
            });
            setQuantities(initialQuantities);

            // Cập nhật tổng tiền
            const total = items.reduce((sum, item) => {
                const price = item.product_id?.discountPrice ?? item.product_id?.price ?? 0;
                return sum + price * item.quantity;
            }, 0);
            setTotal(total);

            cartEvent.emit('update-cart-count');
        } catch (err) {
            console.error('❌ Lỗi fetchCart:', err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

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
            setRemovedHandled(true); // ✅ Đánh dấu đã xử lý
        }
    }, [removedItems, removedHandled]);

    const updateQuantity = async (productId, delta) => {
        const currentQty = quantities[productId] || 1;
        const newQuantity = currentQty + delta;
        if (newQuantity < 1) return;

        try {
            // 🟢 Gọi API trước để chắc chắn backend cập nhật thành công
            await axiosClient.put('/carts/update', {
                product_id: productId,
                quantity: newQuantity,
            });

            // Nếu thành công thì mới cập nhật UI
            setQuantities((prev) => ({
                ...prev,
                [productId]: newQuantity,
            }));
        } catch (error) {
            console.error('❌ Lỗi cập nhật số lượng:', error);
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
            {/* Cart Container */}
            <div className={cx('container')}>
                {/* CheckOut Step List */}
                <CheckoutStep currentStep={1} />

                {/* Main */}
                <div className={cx('header')}>
                    <h3>1. GIỎ HÀNG CỦA BẠN</h3>
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

                            console.log('✅ item.product_id:', item.product_id);

                            if (!item.product_id || typeof item.product_id !== 'object') return null;
                            if (!item.product_id.name || !item.product_id.images || !item.product_id.slug) {
                                console.warn('⚠️ product_id thiếu dữ liệu:', item.product_id);
                                return null;
                            }

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
                                        <span>{quantities[productId] ?? item.quantity}</span>
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
