import React, { useEffect, useState } from 'react';
import cartEvent from '~/utils/cartEvent';
import axiosClient from '~/utils/axiosClient';

export default function CartCount() {
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const res = await axiosClient.get('/carts/count');
            setCartCount(res.data.count);
        } catch {
            setCartCount(0);
        }
    };

    useEffect(() => {
        fetchCartCount(); // Gọi lần đầu

        // 👇 Đổi sự kiện đúng tên
        cartEvent.on('update-cart-count', fetchCartCount);

        return () => cartEvent.off('update-cart-count', fetchCartCount);
    }, []);

    return <span>{cartCount}</span>;
}
