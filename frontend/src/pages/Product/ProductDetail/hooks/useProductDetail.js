import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '~/utils/axiosClient';

export default function useProductDetail(slug) {
    const [product, setProduct] = useState(null);
    const [posts, setPosts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [promotionGifts, setPromotionGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product
    useEffect(() => {
        if (!slug) return;
        window.scrollTo(0, 0);
        setLoading(true);

        axios
            .get(`http://localhost:5000/api/products/${slug}`)
            .then((res) => {
                const data = res.data;
                data.status = Array.isArray(data.status) ? data.status : [data.status];
                setProduct(data);
            })
            .catch(() => setError('Không tìm thấy sản phẩm'))
            .finally(() => setLoading(false));
    }, [slug]);

    // Fetch posts
    useEffect(() => {
        axiosClient
            .get('/posts?limit=4')
            .then((res) => setPosts(Array.isArray(res.data) ? res.data : res.data.posts || []))
            .catch(() => setPosts([]));
    }, []);

    // Fetch promotions
    useEffect(() => {
        if (!product?._id) return;

        axiosClient
            .get(`/promotion-gifts/by-product/${product._id}`)
            .then((res) => setPromotionGifts(res.data || []))
            .catch(() => setPromotionGifts([]));
    }, [product]);

    // Fetch related products
    useEffect(() => {
        if (!product) return;

        axios
            .get(`http://localhost:5000/api/products/related?category=${product.category._id}&exclude=${product._id}`)
            .then((res) => setRelatedProducts(res.data))
            .catch(() => setRelatedProducts([]));
    }, [product]);

    return {
        product,
        posts,
        relatedProducts,
        promotionGifts,
        loading,
        error,
    };
}
