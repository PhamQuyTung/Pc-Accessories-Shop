import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosClient from '~/utils/axiosClient';

export default function useProductDetail(slug) {
    const [product, setProduct] = useState(null);
    const [posts, setPosts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [promotionGifts, setPromotionGifts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product (có delay 2 giây)
    useEffect(() => {
        if (!slug) return;
        window.scrollTo(0, 0);
        setLoading(true);

        const fetchProduct = axios.get(`http://localhost:5000/api/products/${slug}`);
        const delay = new Promise((resolve) => setTimeout(resolve, 2000)); // ⏳ delay 2s

        Promise.all([fetchProduct, delay])
            .then(([res]) => {
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
            // .then((res) => setPosts(Array.isArray(res.data) ? res.data : res.data.posts || []))
            .catch(() => setPosts([]));
    }, []);

    // lấy quà tặng trực tiếp từ product.gifts (API products trả về)
    useEffect(() => {
        if (!product) return;
        const gifts = Array.isArray(product.gifts) ? product.gifts : [];
        setPromotionGifts(gifts);
    }, [product]);

    // Fetch promotion offers (discount rules) that apply to this product
    useEffect(() => {
        if (!product?._id) return;

        axiosClient
            .get(`/promotion-gifts/by-product/${product._id}`)
            .then((res) => {
                const data = res.data?.promotion || res.data?.promotions || res.data;
                setPromotions(Array.isArray(data) ? data : data ? [data] : []);
            })
            .catch(() => setPromotions([]));
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
        promotions,
        loading,
        error,
    };
}
