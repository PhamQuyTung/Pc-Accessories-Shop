import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import PromotionsSection from './PromotionsSection/PromotionsSection';

function formatPromotionName(name) {
    return name
        .toLowerCase()
        .normalize('NFD') // tách dấu
        .replace(/[\u0300-\u036f]/g, '') // xóa dấu
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-') // thay space & ký tự đặc biệt bằng -
        .replace(/^-+|-+$/g, ''); // xóa - ở đầu/cuối
}

export default function PromotionsWrapper() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const { data } = await axiosClient.get('/promotions/active');
                const validPromotions = (data || []).map((promo) => ({
                    ...promo,
                    assignedProducts: (promo.assignedProducts || [])
                        .map((ap) => ap.product)
                        .filter((p) => p && p.isVisible !== false),
                }));
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
    if (promotions.length === 0) return null;

    return (
        <>
            {promotions.map((promo) => {
                const promoLink = `/collections/${formatPromotionName(promo.name)}`;
                return (
                    <PromotionsSection
                        key={promo._id}
                        title={promo.name}
                        endTime={promo.once?.endAt || promo.daily?.endDate || null}
                        detailHref={promoLink}
                        banner={{
                            href: promoLink,
                            img: promo.bannerImg || '/default-banner.jpg',
                            alt: promo.name,
                        }}
                        products={promo.assignedProducts}
                        headerBgColor={promo.headerBgColor}
                        headerTextColor={promo.headerTextColor}
                        promotionCardImg={promo.promotionCardImg}
                        productBannerImg={promo.productBannerImg}
                    />
                );
            })}
        </>
    );
}
