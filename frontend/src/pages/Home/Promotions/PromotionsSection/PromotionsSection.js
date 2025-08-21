import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import classNames from 'classnames/bind';
import styles from './PromotionsSection.module.scss';

import ProductCard from '../ProductCard/PromoCard';

const cx = classNames.bind(styles);

export default function PromotionsSection({ title, icon, endTime, detailHref, banner, products }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(endTime) - new Date();
            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <section className={cx('section')}>
            {/* Header */}
            <div className={cx('header')}>
                <div className={cx('header-right')}>
                    <h2 className={cx('title')}>
                        {icon && <span className={cx('icon')}>{icon}</span>} {title}
                    </h2>
                    <div className={cx('countdown')}>
                        {timeLeft.days > 0 && (
                            <div className={cx('timeBox')}>
                                <span className={cx('number')}>{timeLeft.days}</span>
                                <span className={cx('label')}>Ngày</span>
                            </div>
                        )}
                        <div className={cx('timeBox')}>
                            <span className={cx('number')}>{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className={cx('label')}>Giờ</span>
                        </div>
                        <div className={cx('timeBox')}>
                            <span className={cx('number')}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className={cx('label')}>Phút</span>
                        </div>
                        <div className={cx('timeBox')}>
                            <span className={cx('number')}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className={cx('label')}>Giây</span>
                        </div>
                    </div>
                </div>
                <a href={detailHref} className={cx('detail-link')}>
                    Xem chi tiết →
                </a>
            </div>

            <div className={cx('bg')}>
                <div className={cx('content')}>
                    {/* Banner trái */}
                    <a href={banner.href} className={cx('banner')}>
                        <img src={banner.img} alt={banner.alt} />
                    </a>
    
                    {/* Carousel phải */}
                    <div className={cx('carousel')}>
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={16}
                            loop
                            navigation
                            autoplay={{ delay: 3000 }}
                            modules={[Autoplay, Navigation]}
                        >
                            {products.map((p) => (
                                <SwiperSlide key={p.id}>
                                    <ProductCard product={p} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
}
