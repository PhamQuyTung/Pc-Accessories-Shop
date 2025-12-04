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
        }
    };

    // ============================
    //  Tổng số lượng
    // ============================
    const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    // ============================
    //  Tổng tiền
    // ============================
    const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);

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
