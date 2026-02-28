// CartPage.js (các import giữ nguyên)
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
                initialQuantities[item._id] = item.quantity;
            });
            setQuantities(initialQuantities);

            cartEvent.emit('update-cart-count');

            if (items.length > 0) {
                const promoRes = await axiosClient.post('/promotion-gifts/apply-cart', {
                    cartItems: items.map((i) => ({
                        product_id: i.product_id?._id,
                        variation_id: i.variation_id?._id || null,
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

    // removed items alert
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

    const updateQuantity = async (cartItemId, delta) => {
        if (isUpdating) return;
        setIsUpdating(true);

        const currentQty = quantities[cartItemId] || 1;
        const newQuantity = currentQty + delta;
        if (newQuantity < 1) {
            setIsUpdating(false);
            return;
        }

        try {
            await axiosClient.put('/carts/update', {
                cartItemId,
                quantity: newQuantity,
            });
            setQuantities((prev) => ({ ...prev, [cartItemId]: newQuantity }));
            cartEvent.emit('update-cart-count');
            await fetchCart();
        } catch (error) {
            console.error('❌ Lỗi cập nhật số lượng:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            await axiosClient.delete('/carts/remove', { data: { cartItemId } });
            toast('Đã xoá sản phẩm khỏi giỏ hàng!', 'success');
            await fetchCart();
            cartEvent.emit('update-cart-count');
        } catch (err) {
            console.error('❌ Lỗi removeFromCart:', err);
        }
    };

    // ================= HELPER: Extract price từ variation hoặc product =================
    const getPriceData = (product, variation) => {
        const toNum = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);

        if (variation) {
            // ✅ Ưu tiên lấy từ variation
            const discountPrice = toNum(variation.discountPrice);
            const price = toNum(variation.price);

            if (price === 0) {
                console.warn('⚠️ Variation price is 0:', { product: product.name, variation });
            }

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
        if (!variation?.attributes?.length) return null;

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

    // ================= Tính tổng =================
    const subTotal = cartItems.reduce((acc, item) => {
        const product = item.product_id || {};
        const variation = item.variation_id || null;

        const { basePrice, originalPrice, hasDiscount } = getPriceData(product, variation);
        const quantity = quantities[item._id] || item.quantity || 1;

        // If this cart entry is a gift, its price contribution is zero
        const isGift = !!item.isGift;
        if (isGift) {
            return acc; // gift items do not add to subtotal
        }

        // Tìm khuyến mãi được áp cho sản phẩm này
        const relatedPromo = (promotionSummary.discounts || []).find(
            (d) => String(d.productId) === String(product._id)
        );
        const appliedDiscount = relatedPromo && relatedPromo.discountPerItem ? Number(relatedPromo.discountPerItem) : 0;
        const discountedQty = relatedPromo ? Math.min(Number(relatedPromo.discountedQty || 0), quantity) : 0;
        const undiscountedQty = quantity - discountedQty;

        // Tính subtotal: chỉ áp dụng discount cho discountedQty sản phẩm
        let itemTotal;
        if (appliedDiscount > 0 && discountedQty > 0) {
            const discountedPrice = Math.max(basePrice - appliedDiscount, 0);
            itemTotal = (discountedQty * discountedPrice) + (undiscountedQty * basePrice);
        } else {
            itemTotal = quantity * basePrice;
        }

        return acc + itemTotal;
    }, 0);

    const totalDiscount = promotionSummary.totalDiscount || 0;
    const totalPrice = subTotal; // Tổng = Tạm tính (khuyến mãi đã tính vào giá)

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

    // ================= Render một dòng sản phẩm =================
    const renderCartRow = (item) => {
        const product = item.product_id || {};
        const variation = item.variation_id || null;
        const cartItemId = item._id;
        const isGift = item.isGift;

        // ✅ Extract image ưu tiên variation → product
        const imageSrc = variation?.images?.[0] || product.images?.[0];

        // ✅ Get base price data (for gifts we override later)
        let { basePrice, originalPrice, hasDiscount } = getPriceData(product, variation);

        // ✅ Get variation label (attributes)
        const variationLabel = getVariationLabel(variation);

        // ✅ Quantity: gifts keep their stored quantity and are not editable
        const qty = isGift ? item.quantity : quantities[cartItemId] || item.quantity || 1;


        // Nếu sản phẩm này nằm trong danh sách sản phẩm điều kiện của 1 chương trình,
        // hiển thị tên chương trình dưới tên sản phẩm chính
        const mainPromo = (promotionSummary.discounts || []).find((d) =>
            Array.isArray(d.promotionConditionIds) && d.promotionConditionIds.includes(String(product._id))
        );

        // Tìm khuyến mãi áp cho sản phẩm này (sản phẩm được giảm giá, không phải điều kiện)
        const relatedPromo = (promotionSummary.discounts || []).find((d) =>
            String(d.productId) === String(product._id)
        );

        // ===== Tính toán giá hiển thị (bao gồm khuyến mãi áp cho sản phẩm này) =====
        const appliedDiscount = relatedPromo && relatedPromo.discountPerItem ? Number(relatedPromo.discountPerItem) : 0;

        // displayOriginalPrice: giá bị gạch (nếu có)
        // displayFinalPrice: giá sau tất cả các giảm (product discount + promo)
        let displayOriginalPrice = null;
        let displayFinalPrice = basePrice; // basePrice đã tính discountPrice của product/variation nếu có

        // nếu là quà tặng thì giá luôn bằng 0
        if (isGift) {
            displayFinalPrice = 0;
            displayOriginalPrice = null;
            hasDiscount = false;
        }

        if (hasDiscount) {
            displayOriginalPrice = originalPrice; // gạch giá gốc nếu product đã có discount
            displayFinalPrice = basePrice;
        }

        if (appliedDiscount > 0) {
            // Nếu có khuyến mãi dạng giảm thêm, gạch giá hiện tại và hiển thị giá sau khuyến mãi
            displayOriginalPrice = displayFinalPrice;
            displayFinalPrice = Math.max(displayFinalPrice - appliedDiscount, 0);
        }

        // ✅ Subtotal = tính riêng: chỉ áp discount cho discountedQty sản phẩm
        const discountedQty = relatedPromo ? Math.min(Number(relatedPromo.discountedQty || 0), qty) : 0;
        const undiscountedQty = qty - discountedQty;
        let subtotal;
        if (isGift) {
            subtotal = 0;
        } else if (appliedDiscount > 0 && discountedQty > 0) {
            const discountedPrice = Math.max(basePrice - appliedDiscount, 0);
            subtotal = (discountedQty * discountedPrice) + (undiscountedQty * basePrice);
        } else {
            subtotal = qty * basePrice;
        }

        return (
            <div key={cartItemId} className={cx('row-wrapper')}>
                <div className={cx('row')}>
                    {/* Sản phẩm + Ảnh */}
                    <div className={cx('product', { 'gift-product': isGift })}>
                        <img src={imageSrc || '/placeholder.png'} alt={product.name} />
                        <div>
                            <Link to={`/products/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>

                            {isGift && item.parentProductId && (
                                <div className={cx('gift-note')}>
                                    🎁 Quà tặng kèm khi mua sản phẩm{' '}
                                    <Link to={`/products/${item.parentProductId.slug}`}>{item.parentProductId.name}</Link>
                                </div>
                            )}

                            {/* Hiển thị tên chương trình nếu đây là sản phẩm chính của khuyến mãi */}
                            {!isGift && mainPromo && (
                                <div className={cx('promotion-note')}>
                                    Áp dụng khuyến mãi: <strong>{mainPromo.promotionTitle}</strong>
                                </div>
                            )}

                            {/* Hiển thị biến thể attributes */}
                            {variationLabel && (
                                <div className={cx('variation-label')}>
                                    {variationLabel}
                                </div>
                            )}

                            {/* Nếu đây là sản phẩm được giảm giá, hiển thị chi tiết giảm giá */}
                            {!isGift && relatedPromo && relatedPromo.discountedQty > 0 && (
                                <div className={cx('promotion-note', 'applied')}>
                                    🎁
                                    {' '}
                                    Giảm {Number(relatedPromo.discountPerItem).toLocaleString()}₫ bởi <strong>{relatedPromo.promotionTitle}</strong>
                                    {relatedPromo.discountedQty < qty && (
                                        <span> — {relatedPromo.discountedQty}/{qty} được giảm</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Giá */}
                    <div className={cx('price')}>
                        {displayOriginalPrice && displayOriginalPrice !== displayFinalPrice ? (
                            <>
                                <span className={cx('original-price')}>
                                    {displayOriginalPrice.toLocaleString()}₫
                                </span>
                                <span className={cx('discount-price')}>
                                    {displayFinalPrice.toLocaleString()}₫
                                </span>
                            </>
                        ) : (
                            <span className={cx('price-value')}>
                                {displayFinalPrice.toLocaleString()}₫
                            </span>
                        )}
                    </div>

                    {/* Số lượng (không sửa khi là quà tặng) */}
                    <div className={cx('quantity')}>
                        {isGift ? (
                            <span>{qty}</span>
                        ) : (
                            <>
                                <button onClick={() => updateQuantity(cartItemId, -1)}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => updateQuantity(cartItemId, 1)}>+</button>
                            </>
                        )}
                    </div>

                    {/* Thành tiền */}
                    <div className={cx('subtotal')}>
                        <span className={cx('subtotal-value')}>
                            {subtotal.toLocaleString()}₫
                        </span>
                    </div>
                    {/* nếu quà tặng thì ghi chú thêm giá 0 */}
                    {/* {isGift && (
                        <div className={cx('gift-price-note')}>Giá: miễn phí</div>
                    )} */}

                    {/* Xóa */}
                    <div>
                        <button className={cx('remove')} onClick={() => removeFromCart(cartItemId)}>
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

                        {/* Render tất cả cart items */}
                        {cartItems.map((item) => renderCartRow(item))}
                    </div>

                    {/* Thông tin đơn hàng */}
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

                            {/* <div className={cx('summary-item')}>
                                <span>Khuyến mãi</span>
                                <span>- {totalDiscount.toLocaleString()}₫</span>
                            </div> */}

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
