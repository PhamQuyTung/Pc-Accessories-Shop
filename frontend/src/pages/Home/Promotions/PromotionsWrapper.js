// src/components/Promotions/PromotionsWrapper.js
import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import PromotionsSection from './PromotionsSection/PromotionsSection';

export default function PromotionsWrapper() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const { data } = await axiosClient.get('/promotions/active');
                // Đảm bảo dữ liệu hợp lệ
                const validPromotions = (data || []).map((promo) => ({
                    ...promo,
                    assignedProducts: (promo.assignedProducts || [])
                        .map((ap) => ap.product) // lấy product gốc
                        .filter(
                            (p) => p && p.isVisible !== false, // chỉ loại sp ẩn thôi
                        ),
                }));
                console.log('API Promotions:', data);
                console.log('After filter:', validPromotions);

                setPromotions(validPromotions);
            } catch (err) {
                console.error('❌ Error fetching promotions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    if (loading) return <p>Đang tải khuyến mãi...</p>;

    if (promotions.length === 0) return null; // không có CTKM thì ẩn luôn

    return (
        <>
            {promotions.map((promo) => (
                <PromotionsSection
                    key={promo._id}
                    title={promo.name}
                    // Ưu tiên once.endAt, fallback daily.endDate
                    endTime={promo.once?.endAt || promo.daily?.endDate || null}
                    detailHref={`/promotions/${promo.slug || promo._id}`}
                    banner={{
                        href: `/promotions/${promo.slug || promo._id}`,
                        img: promo.bannerImg || '/default-banner.jpg',
                        alt: promo.name,
                    }}
                    products={promo.assignedProducts}
                    promotionCardImg={promo.promotionCardImg}
                />
            ))}
        </>
    );
}
