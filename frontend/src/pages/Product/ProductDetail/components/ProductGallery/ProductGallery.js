import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import styles from '../../ProductDetail.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function ProductGallery({ images }) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const zoomRefs = useRef([]);

    const handleZoom = (e, index) => {
        const container = zoomRefs.current[index];
        const img = container.querySelector('img');

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = 'scale(2)';
    };

    const handleZoomOut = () => {
        zoomRefs.current.forEach((container) => {
            if (!container) return;
            const img = container.querySelector('img');
            img.style.transform = 'scale(1)';
            img.style.transformOrigin = 'center';
        });
    };

    return (
        <div className={cx('gallery')}>
            {/* Slider ảnh lớn */}
            <Swiper
                spaceBetween={10}
                // navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Navigation, Thumbs, Autoplay]}
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
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                className={cx('mainSwiper')}
            >
                {images?.map((img, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className={cx('zoom-container')}
                            onMouseMove={(e) => handleZoom(e, index)}
                            onMouseLeave={handleZoomOut}
                            ref={(el) => (zoomRefs.current[index] = el)}
                        >
                            <img src={img} alt={`Slide ${index}`} />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Slider thumbnail */}
            <div className={cx('slider-thumb')}>
                <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={5}
                    watchSlidesProgress
                    modules={[Thumbs, Navigation]}
                    // navigation={{
                    //     prevEl: `.${cx('thumb-prev')}`,
                    //     nextEl: `.${cx('thumb-next')}`,
                    // }}
                    // onInit={(swiper) => {
                    //     swiper.params.navigation.prevEl = `.${cx('thumb-prev')}`;
                    //     swiper.params.navigation.nextEl = `.${cx('thumb-next')}`;
                    //     swiper.navigation.init();
                    //     swiper.navigation.update();
                    // }}
                    className={cx('thumbSwiper')}
                >
                    {images?.map((img, index) => (
                        <SwiperSlide key={index}>
                            <span
                                className={cx('thumb-box', {
                                    active: index === activeIndex,
                                })}
                            >
                                <img src={img} alt={`Thumb ${index}`} />
                            </span>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Button next prev */}
                {/* <button className={cx('thumb-prev')}>←</button>
                <button className={cx('thumb-next')}>→</button> */}
            </div>
        </div>
    );
}
