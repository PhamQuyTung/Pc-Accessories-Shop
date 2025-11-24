import { useState, useEffect } from 'react';
import axiosClient from '~/utils/axiosClient';

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
    const addToCart = async (productId, variantId, qty = 1) => {
        try {
            const exists = items.find((item) => item.productId === productId && item.variantId === variantId);

            if (exists) {
                await updateQty(productId, variantId, exists.qty + qty);
                return;
            }

            const newItem = { productId, variantId, qty };
            setItems((prev) => [...prev, newItem]);

            if (userId) {
                await axiosClient.post(`/cart/${userId}`, newItem);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    // --- Cập nhật số lượng ---
    const updateQty = async (productId, variantId, qty) => {
        try {
            setItems((prev) =>
                prev.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, qty } : i)),
            );

            if (userId) {
                await axiosClient.put(`/cart/${userId}`, {
                    productId,
                    variantId,
                    qty,
                });
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
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
