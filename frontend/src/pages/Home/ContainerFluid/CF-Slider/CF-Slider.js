import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CF-Slider.module.scss';
import classNames from 'classnames/bind';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import SLider1 from '~/assets/images/Slider/SliderShow/Slider1.webp';
import SLider2 from '~/assets/images/Slider/SliderShow/Slider2.webp';
import SLider3 from '~/assets/images/Slider/SliderShow/Slider3.webp';
import SLider4 from '~/assets/images/Slider/SliderShow/SLider4.webp';
import SLider5 from '~/assets/images/Slider/SliderShow/Slider5.webp';
import SLider6 from '~/assets/images/Slider/SliderShow/Slider6.webp';
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
            {/* SliderShow */}
            <div className={cx('div15')}>
                <Swiper {...mainSliderConfig} className={cx('custom-swiper')}>
                    <SwiperSlide>
                        <Link to="/thu-cu-doi-moi">
                            <img src={SLider1} alt="Slider1" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Link to="/laptop-gaming">
                            <img src={SLider2} alt="Slider2" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Link to="/laptop-acer-zenbook-14-ux3407qa-qd299ws">
                            <img src={SLider3} alt="Slider3" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Link to="laptop-nvidia-rtx-50">
                            <img src={SLider4} alt="Slider4" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Link to="/pc-gvn">
                            <img src={SLider5} alt="Slider5" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Link to="/man-hinh">
                            <img src={SLider6} alt="Slider6" className={cx('img-slide')} />
                        </Link>
                    </SwiperSlide>
                </Swiper>
            </div>

            {/* Banner */}
            <div className={cx('div2')}>
                <Link to="/lap-top-van-phong">
                    <img src={Banner2} alt="Banner2" />
                </Link>
            </div>
            <div className={cx('div3')}>
                <Link to="/laptop-gaming">
                    <img src={Banner3} alt="Banner3" />
                </Link>
            </div>
            <div className={cx('div13')}>
                <Link to="/pc-gvn-intel-i5-4050">
                    <img src={Banner4} alt="Banner4" />
                </Link>
            </div>
            <div className={cx('div14')}>
                <Link to="/chinh-sach-bang-gia-thu-vga-qua-su-dung">
                    <img src={Banner5} alt="Banner5" />
                </Link>
            </div>
            <div className={cx('div4')}>
                <Link to="/ban-phim-may-tinh">
                    <img src={Banner6} alt="Banner6" />
                </Link>
            </div>
        </div>
    );
}

export default CFSlider;
