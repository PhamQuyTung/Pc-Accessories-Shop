import { useState, useEffect } from 'react';
import axiosClient from '~/utils/axiosClient';
import cartEvent from '~/utils/cartEvent';

export default function useCart(userId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // ============================
    //  Lấy giỏ hàng
    // ============================
    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/carts'); // backend tự lấy user từ token
            setItems(res.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchCart();
    }, [userId]);

    // ============================
    //  Thêm vào giỏ
    // ============================
    const addToCart = async (productId, variationId, qty = 1) => {
        try {
            await axiosClient.post('/carts/add', {
                product_id: productId,
                variation_id: variationId,
                quantity: qty,
            });

            await fetchCart(); // đồng bộ lại giỏ

            cartEvent.emit('update-cart-count');
        } catch (error) {
            console.error('Add cart error:', error);
            throw error; // ✅ Throw để component catch
        }
    };

    // ============================
    //  Cập nhật số lượng
    // ============================
    const updateQty = async (cartItemId, quantity) => {
        try {
            await axiosClient.put('/carts/update', {
                cartItemId,
                quantity,
            });

            await fetchCart();
        } catch (error) {
            console.error('Update qty error:', error);
            throw error;
        }
    };

    // ============================
    //  Xóa item
    // ============================
    const removeItem = async (cartItemId) => {
        try {
            // Cập nhật UI trước
            setItems((prev) => prev.filter((i) => i._id !== cartItemId));

            // Gửi API xóa
            await axiosClient.delete('/carts/remove', {
                data: { cartItemId },
            });

            await fetchCart();
        } catch (error) {
            console.error('Remove item error:', error);
            throw error;
        }
    };

    // ============================
    //  Helper: Extract giá từ item
    // ============================
    const getItemPrice = (item) => {
        const toNum = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);
        
        if (item.variation_id) {
            // ✅ Lấy giá từ variation (ưu tiên discountPrice)
            const discountPrice = toNum(item.variation_id.discountPrice);
            const price = toNum(item.variation_id.price);
            return discountPrice > 0 ? discountPrice : price;
        } else {
            // Fallback to product
            const discountPrice = toNum(item.product_id?.discountPrice);
            const price = toNum(item.product_id?.price);
            return discountPrice > 0 ? discountPrice : price;
        }
    };

    // ============================
    //  Tổng số lượng
    // ============================
    const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    // ============================
    //  Tổng tiền (✅ FIX: extract giá đúng)
    // ============================
    const totalPrice = items.reduce((sum, i) => {
        const price = getItemPrice(i);
        const qty = i.quantity || 0;
        return sum + (price * qty);
    }, 0);

    return {
        items,
        loading,
        addToCart,
        updateQty,
        removeItem,
        totalQty,
        totalPrice,
    };
}
