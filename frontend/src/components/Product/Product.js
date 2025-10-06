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

const cx = classNames.bind(styles);

function Product({ category }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    category, // slug như 'pc-gvn', 'laptop', etc.
                    limit: 8, // hoặc số bạn muốn hiển thị
                    status: true,
                };

                // console.log('📦 Gửi request với params:', params); // 👉 thêm dòng này

                const res = await axiosClient.get('/products', {
                    params,
                });

                const data = res.data;

                if (Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    setProducts([]);
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
            {/* Swiper with custom navigation buttons */}
            <button className={cx('prev-btn')}>
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <button className={cx('next-btn')}>
                <FontAwesomeIcon icon={faAngleRight} />
            </button>

            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={10}
                slidesPerView={5}
                loop={products.length > 5} // 👉 chỉ bật loop khi đủ slide
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation={{
                    prevEl: `.${cx('prev-btn')}`,
                    nextEl: `.${cx('next-btn')}`,
                }}
                onInit={(swiper) => {
                    // Fix: for custom navigation buttons to work
                    swiper.params.navigation.prevEl = `.${cx('prev-btn')}`;
                    swiper.params.navigation.nextEl = `.${cx('next-btn')}`;
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
            >
                {products.map((product) => (
                    <SwiperSlide key={product._id} className={cx('custom-slide')}>
                        <div className={cx('product-card')}>
                            <div className={cx('proloop-label--bottom')}>
                                {product.status.includes('quà tặng') && (
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

                                {/* Hiển thị icon nhỏ nếu product.gifts có quà kèm */}
                                {Array.isArray(product.gifts) && product.gifts.length > 0 && (
                                    <span className={cx('gift-badge')}>
                                        <GiftIcon className={cx('icon-gift-small')} />
                                    </span>
                                )}
                            </div>

                            <Link to={`/products/${product.slug}`}>
                                <img src={product.images?.[0]} alt={product.name} />
                            </Link>

                            <div className={cx('proloop-label--bottom')}>
                                {(() => {
                                    switch (product.status?.trim()) {
                                        case 'sản phẩm mới':
                                            return <span className={cx('new-tag')}>Sản phẩm mới</span>;
                                        case 'hàng rất nhiều':
                                            return <span className={cx('very-many-tag')}>Hàng rất nhiều</span>; // 👈 Thêm dòng này
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

                                {/* Góc phải dưới: Bán chạy */}
                                {product.isBestSeller && (
                                    <span className={cx('bestseller-tag')}>
                                        <FireIcon className={cx('icon-fire')} />
                                        <span className={cx('bestseller-label')}>
                                            Bán chạy
                                        </span>
                                    </span>
                                )}
                            </div>

                            <div className={cx('product-card__des')}>
                                <Link to={`/products/${product.slug}`}>{product.name}</Link>

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

                                <div className={cx('price')}>
                                    {product.discountPrice && product.discountPrice < product.price ? (
                                        <>
                                            <div className={cx('price-wrap1')}>
                                                <span className={cx('original-price')}>
                                                    {product.price.toLocaleString()}₫
                                                </span>
                                            </div>
                                            <div className={cx('price-wrap2')}>
                                                <span className={cx('discount-price')}>
                                                    {product.discountPrice.toLocaleString()}₫
                                                </span>
                                                <span className={cx('discount-percent')}>
                                                    -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className={cx('price-wrap2')}>
                                            <span className={cx('discount-price')}>
                                                {product.price.toLocaleString()}₫
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Rating Star */}
                                <div className={cx('rating')}>
                                    <BasicRating value={product.averageRating || 0} />
                                    {/* {console.log('⭐ Rating:', product.averageRating)} */}
                                    <span className={cx('rating-count')}>({product.reviewCount || 0} đánh giá)</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default Product;
