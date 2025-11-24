import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useProductReviews(productId, toast) {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    const fetchReviews = () => {
        if (!productId) return;

        axios.get(`http://localhost:5000/api/reviews/product/${productId}`).then((res) => {
            const data = res.data;
            setReviews(data);
            const avg = data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
            setAverageRating(avg);
        });
    };

    useEffect(fetchReviews, [productId]);

    const submitReview = async (rating, comment) => {
        const token = localStorage.getItem('token');
        if (!token) return toast('Vui lòng đăng nhập', 'warning');

        try {
            await axios.post(
                `http://localhost:5000/api/reviews/product/${productId}`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            toast('Gửi đánh giá thành công!', 'success');
            fetchReviews();
        } catch {
            toast('Không thể gửi đánh giá', 'error');
        }
    };

    return {
        reviews,
        averageRating,
        submitReview,
    };
}
