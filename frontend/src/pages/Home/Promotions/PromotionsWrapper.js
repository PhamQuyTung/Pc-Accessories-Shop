import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import PromotionsSection from './PromotionsSection/PromotionsSection';

export default function PromotionsWrapper() {
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        (async () => {
            const { data } = await axiosClient.get('/promotions/active');
            console.log(data);
            setPromotions(data);
        })();
    }, []);

    return (
        <>
            {promotions.map((promo) => (
                <PromotionsSection
                    key={promo._id}
                    title={promo.name}
                    endTime={promo.once?.endAt || promo.daily?.endDate}
                    detailHref={`/promotions/${promo._id}`} // hoặc slug
                    banner={{
                        href: `/promotions/${promo._id}`,
                        img: promo.bannerImg || '/default-banner.jpg',
                        alt: promo.name,
                    }}
                    products={promo.assignedProducts.map((ap) => ap.product)}
                />
            ))}
        </>
    );
}
