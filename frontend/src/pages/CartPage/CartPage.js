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
    const [promotionSummary, setPromotionSummary] = useState({ totalDiscount: 0, discounts: [] });
    const [isUpdating, setIsUpdating] = useState(false);

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

            // ✅ Gọi API áp dụng khuyến mãi
            if (items.length > 0) {
                const promoRes = await axiosClient.post('/promotion-gifts/apply-cart', {
                    cartItems: items.map((i) => ({
                        product_id: i.product_id._id,
                        quantity: i.quantity,
                        createdAt: i.createdAt,
                    })),
                });
                setPromotionSummary(promoRes.data || { totalDiscount: 0, discounts: [] });
            } else {
                setPromotionSummary({ totalDiscount: 0, discounts: [] });
            }
        } catch (err) {
            console.error('❌ Lỗi fetchCart:', err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // === Cảnh báo sản phẩm bị xóa ===
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
        if (isUpdating) return;
        setIsUpdating(true);

        const currentQty = quantities[productId] || 1;
        const newQuantity = currentQty + delta;
        if (newQuantity < 1) return;

        try {
            await axiosClient.put('/carts/update', {
                product_id: productId,
                quantity: newQuantity,
            });
            setQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
            cartEvent.emit('update-cart-count');
            await fetchCart();  // ✅ Cập nhật lại giỏ hàng để lấy khuyến mãi mới
        } catch (error) {
            console.error('❌ Lỗi cập nhật số lượng:', error);
        } finally {
            setIsUpdating(false); // ✅ đảm bảo reset lại sau mỗi thao tác

        }
    };

    // === Xóa sản phẩm ===
    const removeFromCart = async (productId) => {
        await axiosClient.delete('/carts/remove', { data: { product_id: productId } });
        toast('Đã xoá sản phẩm khỏi giỏ hàng!', 'success');
        fetchCart();
        cartEvent.emit('update-cart-count');
    };

    // === Tổng trước giảm ===
    const subTotal = cartItems.reduce((acc, item) => {
        const product = item.product_id;
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
        const quantity = quantities[product._id] || item.quantity;
        return acc + finalPrice * quantity;
    }, 0);

    const totalDiscount = promotionSummary.totalDiscount || 0;
    const totalPrice = subTotal - totalDiscount;

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

    // === Render một dòng sản phẩm (có thể tách ra nhiều dòng nếu có promo) ===
    const renderCartRow = (item, promoItem) => {
        const product = item.product_id;
        const productId = product._id;
        const basePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

        // Nếu có khuyến mãi, chia ra 2 dòng
        if (promoItem) {
            const totalQty = (promoItem.discountedQty || 0) + (promoItem.normalQty || 0);
            const discountPerItem = promoItem.discountPerItem || 0;
            const discountedPrice = basePrice - discountPerItem;

            const totalDiscounted = promoItem.discountedQty * discountedPrice;
            const totalNormal = promoItem.normalQty * basePrice;
            const total = totalDiscounted + totalNormal;

            return (
                <div key={productId} className={cx('row-wrapper')}>
                    <div className={cx('row', 'promo-row')}>
                        <div className={cx('product')}>
                            <img
                                src={Array.isArray(product.images) ? product.images[0] : product.images}
                                alt={product.name}
                            />
                            <div className={cx('info')}>
                                <Link to={`/products/${product.slug}`} className={cx('product-name')}>
                                    {product.name}
                                </Link>
                                {promoItem.discountedQty > 0 && (
                                    <div
                                        className={cx('promo-tag')}
                                        data-tooltip={`Giảm ${promoItem.discountedQty} sản phẩm, ${promoItem.normalQty} không giảm`}
                                    >
                                        <FaGift /> {promoItem.promotionTitle} ({promoItem.discountedQty}/{totalQty})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={cx('price')}>
                            {promoItem.discountedQty > 0 ? (
                                <>
                                    <span className={cx('original')}>{basePrice.toLocaleString()}₫</span>
                                    <span className={cx('discounted')}>{discountedPrice.toLocaleString()}₫</span>
                                </>
                            ) : (
                                <span>{basePrice.toLocaleString()}₫</span>
                            )}
                        </div>

                        <div className={cx('quantity')}>
                            <button onClick={() => updateQuantity(productId, -1)}>-</button>
                            <span>{quantities[productId] || totalQty}</span>
                            <button onClick={() => updateQuantity(productId, 1)}>+</button>
                        </div>

                        <div className={cx('subtotal')}>
                            <span className={cx('discounted')}>{total.toLocaleString()}₫</span>
                        </div>

                        <div>
                            <button className={cx('remove')} onClick={() => removeFromCart(productId)}>
                                <FaTrashAlt />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Không có khuyến mãi → render bình thường
        const qty = quantities[productId] || item.quantity;
        const total = basePrice * qty;
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
                        <span className={cx('discounted')}>{basePrice.toLocaleString()}₫</span>
                    </div>
                    <div className={cx('quantity')}>
                        <button onClick={() => updateQuantity(productId, -1)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQuantity(productId, 1)}>+</button>
                    </div>
                    <div className={cx('subtotal')}>
                        <span>{total.toLocaleString()}₫</span>
                    </div>
                    <div>
                        <button className={cx('remove')} onClick={() => removeFromCart(productId)}>
                            <FaTrashAlt />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                    <div className={cx('table')}>
                        <div className={cx('header')}>
                            <div>Sản phẩm</div>
                            <div>Giá</div>
                            <div>Số lượng</div>
                            <div>Thành tiền</div>
                            <div>Xóa</div>
                        </div>

                        {cartItems.map((item) => {
                            const promoItem = promotionSummary.discounts?.find(
                                (p) => p.productId === item.product_id._id,
                            );
                            return renderCartRow(item, promoItem);
                        })}
                    </div>

                    <div className={cx('summary')}>
                        <div className={cx('summary-wrap')}>
                            <h3>Thông tin đơn hàng</h3>

                            <div className={cx('summary-item')}>
                                <span>Tạm tính</span>
                                <span>{subTotal.toLocaleString()}₫</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className={cx('summary-item')}>
                                <span>Khuyến mãi</span>
                                <span>- {totalDiscount.toLocaleString()}₫</span>
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
