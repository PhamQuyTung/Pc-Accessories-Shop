// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './ProductCard.module.scss';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FireIcon, GiftIcon } from '../Icons/Icons';
import BasicRating from '~/components/Rating/Rating';
import { getDefaultDisplayName } from '~/utils/getDefaultDisplayName';

const cx = classNames.bind(styles);

function Product({ category }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===================== Fetch Products =====================
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/products', {
                    params: { category, limit: 8, status: true },
                });

                const data = res.data;
                if (Array.isArray(data.products)) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('❌ Lỗi khi fetch sản phẩm:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    return (
        <div className={cx('product-wrapper')}>
            {/* Swiper Buttons */}
            <button className={cx('prev-btn')}>
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <button className={cx('next-btn')}>
                <FontAwesomeIcon icon={faAngleRight} />
            </button>

            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={10}
                loop={products.length > 5}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation={{
                    prevEl: `.${cx('prev-btn')}`,
                    nextEl: `.${cx('next-btn')}`,
                }}
                breakpoints={{
                    320: { slidesPerView: 1.2, spaceBetween: 10 },
                    480: { slidesPerView: 2, spaceBetween: 10 },
                    768: { slidesPerView: 3, spaceBetween: 15 },
                    1024: { slidesPerView: 4, spaceBetween: 20 },
                    1280: { slidesPerView: 5, spaceBetween: 24 },
                }}
                onInit={(swiper) => {
                    swiper.params.navigation.prevEl = `.${cx('prev-btn')}`;
                    swiper.params.navigation.nextEl = `.${cx('next-btn')}`;
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
            >
                {products.map((product) => {
                    // ===================== Default Variation Logic =====================
                    let defaultVariation = null;

                    // Nếu có defaultVariantId thì tìm đúng biến thể đó
                    if (product.defaultVariantId && Array.isArray(product.variations)) {
                        defaultVariation = product.variations.find((v) => v._id === product.defaultVariantId);
                    }

                    // Nếu không có → fallback biến thể đầu tiên
                    if (!defaultVariation) {
                        defaultVariation = product.variations?.[0] || null;
                    }

                    const displayImage =
                        defaultVariation?.thumbnail || defaultVariation?.images?.[0] || product.images?.[0];

                    const displayPrice = defaultVariation
                        ? (defaultVariation.discountPrice ?? defaultVariation.price)
                        : (product.discountPrice ?? product.price);

                    const originalPrice = defaultVariation ? defaultVariation.price : product.price;

                    const hasDiscount =
                        defaultVariation?.discountPrice && defaultVariation.discountPrice < defaultVariation.price;

                    return (
                        <SwiperSlide key={product._id} className={cx('custom-slide')}>
                            <div className={cx('product-card')}>
                                <div className={cx('proloop-label--bottom')}>
                                    {typeof product.status === 'string' &&
                                        product.status.toLowerCase().includes('quà tặng') && (
                                            <span className={cx('gift-tag')}>
                                                <div className={cx('gift-tag__hot')}>
                                                    <FireIcon className={cx('icon-fire')} />
                                                    Quà tặng HOT
                                                </div>
                                                <div className={cx('gift-tag__box')}>
                                                    <GiftIcon className={cx('icon-gift')} />
                                                </div>
                                            </span>
                                        )}

                                    {Array.isArray(product.gifts) &&
                                        product.gifts.some((g) => g && Object.keys(g).length > 0) && (
                                            <span className={cx('gift-badge')}>
                                                <GiftIcon className={cx('icon-gift-small')} />
                                            </span>
                                        )}
                                </div>

                                {/* IMAGE WITH DEFAULT VARIATION */}
                                <Link to={`/products/${product.slug}`}>
                                    <img src={displayImage} alt={product.name} />
                                </Link>

                                <div className={cx('proloop-label--bottom')}>
                                    {(() => {
                                        switch (product.status?.trim()) {
                                            case 'sản phẩm mới':
                                                return <span className={cx('new-tag')}>Sản phẩm mới</span>;
                                            case 'hàng rất nhiều':
                                                return <span className={cx('very-many-tag')}>Hàng rất nhiều</span>;
                                            case 'nhiều hàng':
                                                return <span className={cx('many-tag')}>Nhiều hàng</span>;
                                            case 'còn hàng':
                                                return <span className={cx('in-stock')}>Còn hàng</span>;
                                            case 'sắp hết hàng':
                                                return <span className={cx('low-stock')}>Sắp hết hàng</span>;
                                            case 'hết hàng':
                                                return <span className={cx('out-stock')}>Hết hàng</span>;
                                            case 'đang nhập hàng':
                                                return <span className={cx('importing-tag')}>Đang nhập hàng</span>;
                                            default:
                                                return null;
                                        }
                                    })()}

                                    {product.isBestSeller && (
                                        <span className={cx('bestseller-tag')}>
                                            <FireIcon className={cx('icon-fire')} />
                                            <span className={cx('bestseller-label')}>Bán chạy</span>
                                        </span>
                                    )}
                                </div>

                                <div className={cx('product-card__des')}>
                                    <Link to={`/products/${product.slug}`}>{getDefaultDisplayName(product)}</Link>

                                    {typeof product.specs === 'object' &&
                                        Object.values(product.specs || {}).some(
                                            (value) => typeof value === 'string' && value.trim(),
                                        ) && (
                                            <div className={cx('specs')}>
                                                {Object.values(product.specs || {})
                                                    .filter((value) => typeof value === 'string' && value.trim())
                                                    .map((value, index, array) => (
                                                        <span key={index}>
                                                            {value}
                                                            {index < array.length - 1 && (
                                                                <span className={cx('separator')}> | </span>
                                                            )}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                    {/* PRICE WITH DEFAULT VARIATION */}
                                    <div className={cx('price')}>
                                        {hasDiscount ? (
                                            <>
                                                <div className={cx('price-wrap1')}>
                                                    <span className={cx('original-price')}>
                                                        {originalPrice?.toLocaleString() ?? '0'}₫
                                                    </span>
                                                </div>

                                                <div className={cx('price-wrap2')}>
                                                    <span className={cx('discount-price')}>
                                                        {displayPrice?.toLocaleString() ?? '0'}₫
                                                    </span>

                                                    <span className={cx('discount-percent')}>
                                                        -{Math.round((1 - displayPrice / originalPrice) * 100)}%
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={cx('price-wrap2')}>
                                                <span className={cx('discount-price')}>
                                                    {displayPrice?.toLocaleString() ?? '0'}₫
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={cx('rating')}>
                                        <BasicRating value={product.averageRating || 0} />
                                        <span className={cx('rating-count')}>
                                            ({product.reviewCount || 0} đánh giá)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}

export default Product;
