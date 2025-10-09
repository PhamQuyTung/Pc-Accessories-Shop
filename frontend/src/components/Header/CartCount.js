import React, { useEffect, useState } from 'react';
import cartEvent from '~/utils/cartEvent';
import axiosClient from '~/utils/axiosClient';

export default function CartCount() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        // Hàm load số lượng giỏ hàng
        const fetchCartCount = async () => {
            try {
                const res = await axiosClient.get('/cart/count');
                setCartCount(res.data.count);
            } catch (err) {
                console.error('Lỗi khi lấy cart count:', err);
            }
        };

        // Gọi 1 lần khi load trang
        fetchCartCount();

        // Lắng nghe sự kiện update-cart-count để cập nhật lại
        cartEvent.on('update-cart-count', fetchCartCount);

        // Cleanup khi component unmount
        return () => cartEvent.off('update-cart-count', fetchCartCount);
    }, []);

    return <span>{cartCount}</span>;
}
