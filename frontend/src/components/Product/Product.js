// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Product.module.scss';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FireIcon, GiftIcon } from '../Icons';
import RatingComponent from '../Rating/Rating';

const cx = classNames.bind(styles);

function Product() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/products')
            .then((res) => {
                console.log('Kết quả trả về:', res.data); // <-- Xem console trình duyệt
                setProducts(res.data);
            })
            .catch((err) => console.log('Lỗi gọi API:', err));
    }, []);

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
                loop={true}
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
                    <SwiperSlide key={product._id}>
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
                            </div>

                            <Link to={`/products/${product.slug}`}>
                                <img src={product.image} alt={product.name} />
                            </Link>

                            <div className={cx('proloop-label--bottom')}>
                                {product.status.includes('mới') && <span className={cx('new-tag')}>Sản phẩm mới</span>}
                            </div>

                            <div className={cx('product-card__des')}>
                                <Link to={`/products/${product.slug}`}>{product.name}</Link>

                                <div className={cx('specs')}>
                                    <span>{product.specs.cpu}</span> | <span>{product.specs.vga}</span> |{' '}
                                    <span>{product.specs.ssd}</span> | <span>{product.specs.mainboard}</span> |{' '}
                                    <span>{product.specs.ram}</span>
                                </div>

                                <div className={cx('price')}>
                                    <div className={cx('price-wrap1')}>
                                        <span className={cx('original-price')}>{product.price.toLocaleString()}₫</span>
                                    </div>
                                    <div className={cx('price-wrap2')}>
                                        <span className={cx('discount-price')}>
                                            {product.discountPrice.toLocaleString()}₫
                                        </span>
                                        <span className={cx('discount-percent')}>
                                            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Rating Star */}
                                <div className={cx('rating')}>
                                    <RatingComponent />
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
