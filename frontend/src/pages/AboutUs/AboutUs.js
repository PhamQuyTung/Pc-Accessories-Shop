import React, { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './AboutUs.module.scss';
import { MapPin } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import slide1 from '../../assets/images/AboutUs/Slides/Slide1.jpg';
import slide2 from '../../assets/images/AboutUs/Slides/Slide2.jpg';
import slide3 from '../../assets/images/AboutUs/Slides/Slide3.jpg';
import slide4 from '../../assets/images/AboutUs/Slides/Slide4.jpg';
import OnlineShop from '../../assets/images/AboutUs/MuaSamTrucTuyen/OnlineShop.png';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const AboutUs = () => {
    const swiperRef = useRef(null);

    // ✅ Bắt buộc để đảm bảo autoplay khởi chạy sau React mount hoàn toàn
    useEffect(() => {
        const timer = setTimeout(() => {
            if (swiperRef.current && swiperRef.current.autoplay) {
                swiperRef.current.slideNext(0);
                swiperRef.current.autoplay.start();
            }
        }, 600); // React 19 render delay => nên để ~0.6s
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={cx('about-container')}>
            {/* ✅ Hero Section - Swiper Slide */}
            <section className={cx('hero-slider')}>
                <Swiper
                    modules={[Autoplay, Pagination, Navigation, EffectFade]}
                    spaceBetween={0}
                    centeredSlides
                    observer={true}
                    observeParents={true}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false,
                        stopOnLastSlide: false,
                    }}
                    speed={1000}
                    loop={true}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    pagination={{ clickable: true }}
                    navigation
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    onInit={(swiper) => setTimeout(() => swiper?.autoplay?.start(), 600)}
                    className={cx('hero-swiper')}
                >
                    {[slide1, slide2, slide3, slide4].map((image, i) => (
                        <SwiperSlide key={i}>
                            <div className={cx('slide-content')} style={{ backgroundImage: `url(${image})` }}>
                                <div className={cx('text')}>
                                    <h1>
                                        {i === 0 && (
                                            <>
                                                Chào mừng đến với <span>GearTech</span>
                                            </>
                                        )}
                                        {i === 1 && 'Cộng đồng đam mê công nghệ'}
                                        {i === 2 && 'Trải nghiệm - Kết nối - Nâng tầm'}
                                        {i === 3 && 'Khách hàng hôm nay là đồng đội tương lai!'}
                                    </h1>
                                    <p>
                                        {i === 0 &&
                                            'Hệ sinh thái công nghệ dành cho game thủ và người yêu PC tại Việt Nam.'}
                                        {i === 1 && 'GearTech mang đến không gian trải nghiệm và chia sẻ đẳng cấp.'}
                                        {i === 2 &&
                                            'Cùng GearTech khám phá giải pháp toàn diện cho công nghệ và gaming.'}
                                        {i === 3 &&
                                            'Lan tỏa giá trị tích cực đến cộng đồng game thủ và người yêu công nghệ Việt Nam.'}
                                    </p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* ✅ Mission Section */}
            <section className={cx('mission-section')}>
                <div className={cx('mission-content')}>
                    <h2>Tầm nhìn & Sứ mệnh</h2>
                    <p>
                        GearTech không chỉ là nơi bán máy tính, chúng tôi là một cộng đồng — nơi những người yêu công
                        nghệ có thể kết nối, chia sẻ và trải nghiệm. Đội ngũ tư vấn của GearTech luôn sẵn sàng đồng hành
                        cùng bạn trong việc lựa chọn thiết bị phù hợp nhất cho nhu cầu học tập, làm việc và giải trí.
                    </p>
                </div>
                <div className={cx('quote-box')}>
                    <blockquote>
                        “Khách hàng hôm nay là đồng đội tương lai! GearTech cùng bạn lan tỏa giá trị tích cực đến cộng
                        đồng yêu công nghệ Việt Nam.”
                    </blockquote>
                    <p className={cx('founder')}>— Mr. Nguyễn Minh Tuấn, GearTech Founder</p>
                </div>
            </section>

            {/* ✅ Gallery Section */}
            <section className={cx('gallery-section')}>
                <h2>Không gian trải nghiệm tại GearTech</h2>
                <div className={cx('gallery-grid')}>
                    <img
                        src="https://file.hstatic.net/200000722513/article/z3707883003997_70633b26253118a13b45604dae1c2fed_ecb5525048174d5eaf0000fd2c83ef9d_master.jpg"
                        alt="Showroom GearTech"
                    />
                    <img
                        src="https://tgs.vn/wp-content/uploads/2021/12/267171517_1278526915999879_3176050536150677032_n-1095x730.jpg"
                        alt="Gaming Setup"
                    />
                    <img
                        src="https://congngheviet.com/wp-content/uploads/2022/03/gearvn-tran-hung-dao-0722.jpg"
                        alt="Laptop Display"
                    />
                    <img
                        src="https://thanhnien.mediacdn.vn/Uploaded/baont/2021_12_29/gearvn-kvc-10-9196.jpg"
                        alt="Customer Service"
                    />
                </div>
            </section>

            {/* ✅ Testimonials Section */}
            <section className={cx('testimonials-section')}>
                <h2>Khách hàng nói gì về GearTech?</h2>

                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    className={cx('testimonials-swiper')}
                    breakpoints={{
                        768: { slidesPerView: 2 },
                        1200: { slidesPerView: 3 },
                    }}
                >
                    {[
                        {
                            name: 'Nguyễn Minh Hoàng',
                            role: 'Game Thủ CS2',
                            text: 'GearTech giúp mình có dàn PC cực ổn định, FPS cao và dịch vụ hậu mãi tuyệt vời!',
                            avatar: 'https://i.pravatar.cc/150?img=3',
                        },
                        {
                            name: 'Trần Thị Lan',
                            role: 'Designer Freelance',
                            text: 'Không gian showroom GearTech rất hiện đại. Nhân viên tư vấn cực kỳ thân thiện và có chuyên môn!',
                            avatar: 'https://i.pravatar.cc/150?img=47',
                        },
                        {
                            name: 'Phạm Tuấn Anh',
                            role: 'Streamer',
                            text: 'Mình đã trải nghiệm nhiều nơi, nhưng GearTech có dịch vụ nhanh và chuyên nghiệp nhất.',
                            avatar: 'https://i.pravatar.cc/150?img=15',
                        },
                        {
                            name: 'Lê Hồng Phúc',
                            role: 'IT Developer',
                            text: 'Trải nghiệm mua sắm tại GearTech cực kỳ mượt. Hỗ trợ bảo hành nhanh chóng, đáng tin cậy!',
                            avatar: 'https://i.pravatar.cc/150?img=8',
                        },
                    ].map((review, i) => (
                        <SwiperSlide key={i}>
                            <div className={cx('testimonial-card')}>
                                <img src={review.avatar} alt={review.name} className={cx('avatar')} />
                                <p className={cx('text')}>"{review.text}"</p>
                                <h4>{review.name}</h4>
                                <span className={cx('role')}>{review.role}</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* ✅ Locations */}
            <section className={cx('locations-section')}>
                <h2>Hệ thống Showroom GearTech</h2>

                <div className={cx('location-grid')}>
                    <div>
                        <h3>
                            <MapPin size={22} /> Khu vực miền Bắc
                        </h3>
                        <ul>
                            <li>GearTech Hà Nội - Thái Hà</li>
                        </ul>
                    </div>
                    <div>
                        <h3>
                            <MapPin size={22} /> Khu vực miền Nam
                        </h3>
                        <ul>
                            <li>GearTech TP.HCM - Hoàng Hoa Thám</li>
                            <li>GearTech TP.HCM - Kha Vạn Cân</li>
                            <li>GearTech TP.HCM - Trần Hưng Đạo</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ✅ Online Section - SteelSeries Banner with Side Image */}
            <section className={cx('online-banner')}>
                <div className={cx('banner-left')}>
                    <div className={cx('banner-content')}>
                        <img
                            src="https://w.ladicdn.com/s800x400/5bf3dc7edc60303c34e4991f/untitled-2-04-20210531061436.png"
                            alt="SteelSeries Logo"
                            className={cx('steelseries-logo')}
                        />
                        <img
                            src="https://w.ladicdn.com/s750x400/5bf3dc7edc60303c34e4991f/untitled-2-05-20210531061436.png"
                            alt="Official Store"
                            className={cx('official-store')}
                        />
                        <img
                            src="https://w.ladicdn.com/s700x350/5bf3dc7edc60303c34e4991f/untitled-2-06-20210531061436.png"
                            alt="Description"
                            className={cx('description')}
                        />
                        <img
                            src="https://w.ladicdn.com/s800x350/5bf3dc7edc60303c34e4991f/untitled-2-65-20210716040032.png"
                            alt="Fast Delivery"
                            className={cx('fast-delivery')}
                        />
                        <Link to="/">
                            <button className={cx('buy-now')}>MUA NGAY</button>
                        </Link>
                    </div>
                </div>

                <div className={cx('banner-right')}>
                    <img
                        src="https://w.ladicdn.com/s1100x750/5bf3dc7edc60303c34e4991f/untitled-2-63-20210531085752.png"
                        alt="SteelSeries Banner"
                    />
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
