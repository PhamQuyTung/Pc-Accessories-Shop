import { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';

export default function useFavorite(userId) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Lấy danh sách từ API (nếu có) ---
    useEffect(() => {
        if (!userId) return;

        const fetchFavorites = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/favorites/${userId}`);
                setFavorites(res.data || []);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [userId]);

    // --- Thêm vào yêu thích ---
    const addFavorite = async (productId) => {
        try {
            setFavorites((prev) => [...prev, productId]);

            if (userId) {
                await axiosClient.post(`/favorites/${userId}`, { productId });
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    // --- Xóa khỏi yêu thích ---
    const removeFavorite = async (productId) => {
        try {
            setFavorites((prev) => prev.filter((id) => id !== productId));

            if (userId) {
                await axiosClient.delete(`/favorites/${userId}/${productId}`);
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    // --- Kiểm tra ---
    const isFavorite = (productId) => favorites.includes(productId);

    return {
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
    };
}
