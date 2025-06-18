import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const images = ['/images/pc1.jpg', '/images/pc2.jpg', '/images/pc3.jpg', '/images/pc4.jpg', '/images/pc5.jpg'];

export default function ProductGallery() {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    return (
        <div className={cx('gallery')}>
            {/* Slider ảnh lớn */}
            <Swiper
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Navigation, Thumbs]}
                className={cx('mainSwiper')}
            >
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Slider thumbnail */}
            <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={5}
                watchSlidesProgress
                modules={[Thumbs]}
                className={cx('thumbSwiper')}
            >
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <img src={img} alt={`Thumb ${index}`} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
