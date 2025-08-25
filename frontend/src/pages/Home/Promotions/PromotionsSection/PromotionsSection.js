import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import classNames from 'classnames/bind';
import styles from './PromotionsSection.module.scss';

import { normalizeImageUrl } from '~/utils/normalizeImageUrl';
import ProductCard from '../ProductCard/PromoCard';

const cx = classNames.bind(styles);

export default function PromotionsSection({ title, endTime, detailHref, banner, products = [] }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        if (!endTime) return;
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
                        <span className={cx('icon')}>🔥</span>
                        {title}
                    </h2>

                    {endTime && (
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
                    )}
                </div>
                {detailHref && (
                    <a href={detailHref} className={cx('detail-link')}>
                        Xem chi tiết →
                    </a>
                )}
            </div>

            <div className={cx('bg')}>
                <div className={cx('content')}>
                    {/* Banner trái */}
                    {banner &&
                        (typeof banner === 'string' ? (
                            <div className={cx('banner')}>
                                <img src={normalizeImageUrl(banner)} alt="Promotion banner" />
                            </div>
                        ) : (
                            <a href={banner.href || '#'} className={cx('banner')}>
                                <img src={normalizeImageUrl(banner.img)} alt={banner.alt || 'Promotion banner'} />
                            </a>
                        ))}

                    {/* Carousel phải */}
                    <div className={cx('carousel')}>
                        {products.length > 0 ? (
                            <Swiper
                                slidesPerView={4}
                                spaceBetween={16}
                                loop
                                navigation
                                autoplay={{ delay: 3000 }}
                                modules={[Autoplay, Navigation]}
                            >
                                {products.map((p) => (
                                    <SwiperSlide key={p._id || p.id}>
                                        <ProductCard product={p} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <p className={cx('empty-text')}>Chưa có sản phẩm khuyến mãi</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
