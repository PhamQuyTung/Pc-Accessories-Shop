import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '~/components/Product/ProductCard/ProductCard';
import classNames from 'classnames/bind';
import styles from './RelatedProductsSlider.module.scss';

const cx = classNames.bind(styles);

function RelatedProductsSlider({ relatedProducts }) {
    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <div className={cx('related-products')}>
            <h2>Sản phẩm liên quan</h2>
            <div className={cx('swiper-wrapper-fix')}>
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
                        swiper.params.navigation.prevEl = `.${cx('prev-btn')}`;
                        swiper.params.navigation.nextEl = `.${cx('next-btn')}`;
                        swiper.navigation.init();
                        swiper.navigation.update();
                    }}
                >
                    {relatedProducts.map((item) => (
                        <SwiperSlide key={item._id}>
                            <ProductCard product={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Button prev & next */}
                <button className={cx('prev-btn')}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                <button className={cx('next-btn')}>
                    <FontAwesomeIcon icon={faAngleRight} />
                </button>
            </div>
        </div>
    );
}

export default RelatedProductsSlider;
