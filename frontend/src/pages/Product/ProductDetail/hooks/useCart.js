import { useState, useEffect } from 'react';
import axiosClient from '~/utils/axiosClient';
import cartEvent from '~/utils/cartEvent';

export default function useCart(userId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Lấy giỏ hàng từ API ---
    useEffect(() => {
        if (!userId) return;

        const fetchCart = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/cart/${userId}`);
                setItems(res.data.items || []);
            } catch (error) {
                console.error('Error fetching cart:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId]);

    // --- Thêm sản phẩm ---
    const addToCart = async (productId, variationId, qty = 1) => {
        try {
            await axiosClient.post('/carts/add', {
                product_id: productId,
                variation_id: variationId,
                quantity: qty,
            });

            cartEvent.emit('update-cart-count');
        } catch (e) {
            console.error('Add cart error:', e);
        }
    };

    // --- Cập nhật số lượng ---
    const updateQty = async (itemId, quantity) => {
        await axiosClient.put('/carts/update', {
            item_id: itemId,
            quantity,
        });
    };

    // --- Xóa ---
    const removeItem = async (productId, variantId) => {
        try {
            setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));

            if (userId) {
                await axiosClient.delete(`/cart/${userId}`, {
                    data: { productId, variantId },
                });
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    // --- Tổng số lượng ---
    const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

    // --- Tổng tiền (Backend nên trả price theo variant) ---
    const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);

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
