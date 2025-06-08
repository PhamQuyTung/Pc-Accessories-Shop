import styles from './CF-Slider.module.scss';
import classNames from 'classnames/bind';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import SLider1 from '~/assets/images/Slider/SliderShow/Slider1.webp';
import SLider2 from '~/assets/images/Slider/SliderShow/Slider2.webp';
import SLider3 from '~/assets/images/Slider/SliderShow/Slider3.webp';
import SLider4 from '~/assets/images/Slider/SliderShow/SLider4.webp';
import SLider5 from '~/assets/images/Slider/SliderShow/Slider5.webp';
import Banner2 from '~/assets/images/Slider/Banner2.webp';
import Banner3 from '~/assets/images/Slider/Banner3.webp';
import Banner4 from '~/assets/images/Slider/Banner4.webp';
import Banner5 from '~/assets/images/Slider/Banner5.webp';
import Banner6 from '~/assets/images/Slider/Banner6.webp';
import { mainSliderConfig } from '~/libs/mainSliderConfig';

const cx = classNames.bind(styles);

function CFSlider() {
    return (
        <div className={cx('CFSlider')}>
            <div className={cx('CFSlider-wrap')}>
                {/* SliderShow */}
                <div className={cx('div15')}>
                    <Swiper {...mainSliderConfig} className={cx('custom-swiper')}>
                        <SwiperSlide>
                            <img src={SLider1} alt="Slider1" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={SLider2} alt="Slider2" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={SLider3} alt="Slider3" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={SLider4} alt="Slider4" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={SLider5} alt="Slider5" />
                        </SwiperSlide>
                    </Swiper>
                </div>

                {/* Banner */}
                <div className={cx('div2')}>
                    <img src={Banner2} alt="Banner2" />
                </div>
                <div className={cx('div3')}>
                    <img src={Banner3} alt="Banner3" />
                </div>
                <div className={cx('div13')}>
                    <img src={Banner4} alt="Banner4" />
                </div>
                <div className={cx('div14')}>
                    <img src={Banner5} alt="Banner5" />
                </div>
                <div className={cx('div4')}>
                    <img src={Banner6} alt="Banner6" />
                </div>
            </div>
        </div>
    );
}

export default CFSlider;
