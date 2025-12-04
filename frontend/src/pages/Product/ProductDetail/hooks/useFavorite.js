// ================= FIX: useFavorite.js =================

// filepath: d:\Workspace2\MyProjects\pc_accessories\frontend\src\pages\Product\ProductDetail\hooks\useFavorite.js

import { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';

export default function useFavorite(userId) {
    const [favorites, setFavorites] = useState([]); // Array of product IDs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Lấy danh sách từ API ---
    useEffect(() => {
        if (!userId) {
            setFavorites([]);
            return;
        }

        const fetchFavorites = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await axiosClient.get(`/favorites`);
                
                // ✅ FIX: Extract product IDs từ array of products
                const favoriteIds = Array.isArray(res.data)
                    ? res.data.map(product => 
                        typeof product === 'string' ? product : product._id
                      )
                    : [];
                
                console.log('✅ Favorites loaded:', favoriteIds);
                setFavorites(favoriteIds);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setError(error.message);
                setFavorites([]); // ✅ Fallback to empty array
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [userId]);

    // --- Thêm vào yêu thích ---
    const addFavorite = async (productId) => {
        try {
            // ✅ Optimistic update
            if (!favorites.includes(productId)) {
                setFavorites((prev) => [...prev, productId]);
            }

            if (userId) {
                await axiosClient.post(`/favorites`, { product_id: productId });
                console.log('✅ Favorite added:', productId);
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
            // ✅ Revert on error
            setFavorites((prev) => prev.filter((id) => id !== productId));
            setError(error.message);
        }
    };

    // --- Xóa khỏi yêu thích ---
    const removeFavorite = async (productId) => {
        try {
            // ✅ Optimistic update
            setFavorites((prev) => prev.filter((id) => id !== productId));

            if (userId) {
                await axiosClient.delete(`/favorites/${productId}`);
                console.log('✅ Favorite removed:', productId);
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            // ✅ Revert on error
            setFavorites((prev) => [...prev, productId]);
            setError(error.message);
        }
    };

    // --- Kiểm tra sản phẩm có phải yêu thích không ---
    const isFavorite = (productId) => {
        // ✅ FIX: Ensure favorites is array before calling .includes()
        return Array.isArray(favorites) && favorites.includes(String(productId));
    };

    return {
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
    };
}
