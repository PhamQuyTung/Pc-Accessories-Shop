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
import { SPEC_ICON_MAP } from '~/constants/specIcons';
import { getCardSpecs } from '~/utils/getCardSpecs';

const cx = classNames.bind(styles);

function Product({ category, onHasProductChange }) {
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
                const list = Array.isArray(data.products) ? data.products : [];

                setProducts(list);

                // 🔥 BÁO NGƯỢC LÊN SECTION
                onHasProductChange?.(list.length > 0);
            } catch (error) {
                console.error('❌ Lỗi khi fetch sản phẩm:', error);
                setProducts([]);
                onHasProductChange?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    if (loading) return null;
    if (!products.length) return null;

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
                    // ===================== Default Variation Logic (robust) =====================
                    const variations = Array.isArray(product.variations) ? product.variations : [];
                    const defId = product.defaultVariantId ? String(product.defaultVariantId) : null;

                    // Tìm biến thể mặc định
                    let defaultVariation = null;

                    // Nếu có defaultVariantId, tìm biến thể tương ứng
                    if (defId) {
                        defaultVariation = variations.find((v) => String(v._id) === defId) || null;
                    }

                    // Nếu không tìm thấy biến thể mặc định, lấy biến thể đầu tiên
                    if (!defaultVariation && variations.length > 0) {
                        defaultVariation = variations[0];
                    }

                    // ===================== Merge Specs =====================
                    const cardSpecs = getCardSpecs(product, defaultVariation, 4);

                    // ===================== Display Data =====================
                    const displayImage =
                        defaultVariation?.thumbnail || defaultVariation?.images?.[0] || product.images?.[0];

                    // Robust price logic: treat discountPrice === 0 as "no discount"
                    const toNum = (v) => (typeof v === 'number' && !isNaN(v) ? v : null);

                    const variationPrice = toNum(defaultVariation?.price);
                    const variationDiscount = toNum(defaultVariation?.discountPrice);
                    const productPriceNum = toNum(product?.price);
                    const productDiscountNum = toNum(product?.discountPrice);

                    let displayPrice = 0;
                    let originalPrice = 0;

                    if (defaultVariation) {
                        if (
                            variationDiscount !== null &&
                            variationDiscount > 0 &&
                            variationPrice !== null &&
                            variationDiscount < variationPrice
                        ) {
                            displayPrice = variationDiscount;
                            originalPrice = variationPrice;
                        } else {
                            displayPrice = variationPrice ?? 0;
                            originalPrice = variationPrice ?? 0;
                        }
                    } else {
                        if (
                            productDiscountNum !== null &&
                            productDiscountNum > 0 &&
                            productPriceNum !== null &&
                            productDiscountNum < productPriceNum
                        ) {
                            displayPrice = productDiscountNum;
                            originalPrice = productPriceNum;
                        } else {
                            displayPrice = productPriceNum ?? 0;
                            originalPrice = productPriceNum ?? 0;
                        }
                    }

                    const hasDiscount = originalPrice > 0 && displayPrice < originalPrice;

                    const hasGift =
                        Array.isArray(product.gifts) && product.gifts.some((g) => g && Object.keys(g).length > 0);

                    return (
                        <SwiperSlide key={product._id} className={cx('custom-slide')}>
                            <div className={cx('product-card')}>
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

                                    {cardSpecs.length > 0 && (
                                        <ul className={cx('spec-list')}>
                                            {cardSpecs.map((spec) => {
                                                const Icon = SPEC_ICON_MAP[spec.icon];

                                                return (
                                                    <li key={spec.key} className={cx('spec-item')}>
                                                        {Icon && <Icon className={cx('spec-icon')} />}
                                                        <span>{spec.value}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {/* PRICE WITH DEFAULT VARIATION */}
                                    <div className={cx('price')}>
                                        {hasDiscount ? (
                                            <>
                                                <div className={cx('price-wrap1')}>
                                                    <span className={cx('original-price')}>
                                                        {originalPrice.toLocaleString()}₫
                                                    </span>
                                                </div>

                                                <div className={cx('price-wrap2')}>
                                                    <span className={cx('discount-price')}>
                                                        {displayPrice.toLocaleString()}₫
                                                    </span>

                                                    <span className={cx('discount-percent')}>
                                                        -{Math.round((1 - displayPrice / originalPrice) * 100)}%
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={cx('price-wrap2')}>
                                                <span className={cx('discount-price')}>
                                                    {displayPrice.toLocaleString()}₫
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
