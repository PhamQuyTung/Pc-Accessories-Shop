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
        fetchCartCount(); // Lấy lần đầu

        // Lắng nghe sự kiện cartChanged để cập nhật lại cartCount
        cartEvent.on('cartChanged', fetchCartCount);

        // Cleanup khi component unmount
        return () => cartEvent.off('cartChanged', fetchCartCount);
    }, []);

    return <span>{cartCount}</span>;
}
