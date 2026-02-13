import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import classNames from 'classnames/bind';
import styles from './PromotionsSection.module.scss';
import { Row, Col } from 'react-bootstrap';

import { normalizeImageUrl } from '~/utils/normalizeImageUrl';
import ProductCard from '../PromoCard/PromoCard';

const cx = classNames.bind(styles);

export default function PromotionsSection({
    title,
    endTime,
    detailHref,
    banner,
    products = [],
    promotionCardImg,
    productBannerImg,
    headerBgColor = '#003bb8',
    headerTextColor = '#ffee12',
    promotionType = 'once', // ✅ THÊM: nhận loại promotion
    dailyStartDate, // ✅ THÊM: ngày bắt đầu
    dailyEndDate, // ✅ THÊM: ngày kết thúc
}) {
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

    // ✅ Format ngày theo kiểu VN: dd/MM/yyyy
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <section className={cx('section')}>
            {/* Header */}
            <div
                className={cx('header')}
                style={{
                    backgroundColor: headerBgColor,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                }}
            >
                <div className={cx('header-right')}>
                    <h2
                        className={cx('title')}
                        style={{
                            color: headerTextColor,
                        }}
                    >
                        <span className={cx('icon')}>🔥</span>
                        {title}
                    </h2>

                    {endTime && promotionType === 'once' && (
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

                {/* ✅ THÊM: Hiển thị ngày tháng theo style GearVN */}
                {(promotionType === 'once' && endTime) ||
                (promotionType === 'daily' && (dailyStartDate || dailyEndDate)) ? (
                    <div
                        className={cx('date-range')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                            marginLeft: 'auto',
                        }}
                    >
                        {promotionType === 'once' && endTime ? (
                            <>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: headerTextColor }}>
                                    {formatDate(new Date()).slice(0, 5)}
                                </span>
                                <span style={{ margin: '0 6px', color: headerTextColor, fontWeight: '600' }}>-</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: headerTextColor }}>
                                    {formatDate(endTime)}
                                </span>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: headerTextColor }}>
                                    {formatDate(dailyStartDate).slice(0, 5)}
                                </span>
                                <span style={{ margin: '0 6px', color: headerTextColor, fontWeight: '600' }}>-</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: headerTextColor }}>
                                    {formatDate(dailyEndDate)}
                                </span>
                            </>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Body */}
            <div
                className={cx('bg')}
                style={{
                    backgroundImage: productBannerImg
                        ? `url(${normalizeImageUrl(productBannerImg)})`
                        : `url('/default-promo-bg.jpg')`, // fallback nếu không có
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            >
                <div className={cx('content')}>
                    <Row>
                        <Col xs={12} md={4}>
                            {/* Banner trái */}
                            {banner &&
                                (typeof banner === 'string' ? (
                                    <div className={cx('banner')}>
                                        <img src={normalizeImageUrl(banner)} alt="Promotion banner" />
                                    </div>
                                ) : (
                                    <a href={banner.href || '#'} className={cx('banner')}>
                                        <img
                                            src={normalizeImageUrl(banner.img)}
                                            alt={banner.alt || 'Promotion banner'}
                                        />
                                    </a>
                                ))}
                        </Col>
                        <Col xs={12} md={8}>
                            {/* Carousel phải */}
                            <div className={cx('carousel')}>
                                {products.length > 0 ? (
                                    <Swiper
                                        slidesPerView={4}
                                        spaceBetween={10}
                                        loop
                                        autoplay={{ delay: 3000 }}
                                        modules={[Autoplay, Navigation, Pagination]}
                                    >
                                        {products.map((p) => (
                                            <SwiperSlide key={p._id || p.id}>
                                                <ProductCard product={p} promotionCardImg={promotionCardImg} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                ) : (
                                    <p className={cx('empty-text')}>Chưa có sản phẩm khuyến mãi</p>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>

                {detailHref && (
                    <div className={cx('footer')}>
                        <a href={detailHref} className={cx('view-more-btn')}>
                            Xem thêm khuyến mãi
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
