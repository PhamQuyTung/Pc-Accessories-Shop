import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ContactUs.module.scss';
import LoadingSpinner from '../../components/SpinnerLoading/SpinnerLoading'; // 👈 import spinner

const cx = classNames.bind(styles);

function ContactUs() {
    const [tab, setTab] = useState('hanoi');
    const [fade, setFade] = useState(false);
    const [loading, setLoading] = useState(false); // 👈 trạng thái loading
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Cảm ơn bạn đã liên hệ TECHVN! Chúng tôi sẽ phản hồi sớm nhất.');
        setForm({ name: '', email: '', phone: '', message: '' });
    };

    const info = {
        hanoi: {
            address: '📍 37 Thái Hà, Đống Đa, Hà Nội',
            phone: '☎️ 1900.5325',
            time: '🕒 8:00 – 21:00',
        },
        hcm_hoanghoatham: {
            address: '📍 78-80 Hoàng Hoa Thám, Q. Tân Bình, TP.HCM',
            phone: '☎️ 1900.5325',
            time: '🕒 8:00 – 21:00',
        },
        hcm_khavancan: {
            address: '📍 582 Kha Vạn Cân, Thủ Đức, TP.HCM',
            phone: '☎️ 1900.5325',
            time: '🕒 8:00 – 21:00',
        },
        hcm_tranhungdao: {
            address: '📍 1083 Trần Hưng Đạo, Q.5, TP.HCM',
            phone: '☎️ 1900.5325',
            time: '🕒 8:00 – 21:00',
        },
    };

    const maps = {
        hanoi: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5032058011548!2d105.81821757503099!3d21.01254228063277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abd7a4041695%3A0xa594770e41494bdb!2zR2VhcnZuIFRow6FpIEjDoA!5e0!3m2!1svi!2s!4v1760849149325!5m2!1svi!2s',
        hcm_hoanghoatham:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1614943345335!2d106.64487127480524!3d10.79894038935121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175294a0c97a181%3A0x6aece518177f9a92!2sGEARVN%20Ho%C3%A0ng%20Hoa%20Th%C3%A1m!5e0!3m2!1svi!2s!4v1760849292135!5m2!1svi!2s',
        hcm_khavancan:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.3715108344563!2d106.75683467480611!3d10.859322089294567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527dfdb9a969d%3A0x2733db35aa4da8ff!2zR0VBUlZOIEtoYSBW4bqhbiBDw6Ju!5e0!3m2!1svi!2s!4v1760849358296!5m2!1svi!2s',
        hcm_tranhungdao:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.756446428605!2d106.67159237480458!3d10.753244589394091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752efdc5388623%3A0xd2fd7f15e483624!2zMTA4MyBUcuG6p24gSMawbmcgxJDhuqFvLCBQaMaw4budbmcgNSwgUXXhuq1uIDUsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1760849446113!5m2!1svi!2s',
    };

    // hiệu ứng fade + loading khi đổi tab
    useEffect(() => {
        setFade(true);
        setLoading(true);
        const fadeTimer = setTimeout(() => setFade(false), 400);
        const loadTimer = setTimeout(() => setLoading(false), 1000);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(loadTimer);
        };
    }, [tab]);

    return (
        <div className={cx('contactPage')}>
            <h1 className={cx('title')}>Liên hệ với TECHVN</h1>

            <div className={cx('content')}>
                {/* FORM */}
                <div className={cx('formSection')}>
                    <h2>Gửi tin nhắn cho chúng tôi</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Họ và tên"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={form.phone}
                            onChange={handleChange}
                        />
                        <textarea
                            name="message"
                            placeholder="Nội dung liên hệ"
                            rows="4"
                            value={form.message}
                            onChange={handleChange}
                        />
                        <button type="submit">Gửi liên hệ</button>
                    </form>
                </div>

                {/* GOOGLE MAP + TABS */}
                <div className={cx('mapSection')}>
                    <div className={cx('tabs')}>
                        <div className={cx('tab', { active: tab === 'hanoi' })} onClick={() => setTab('hanoi')}>
                            🏙 Hà Nội (Thái Hà)
                        </div>
                        <div
                            className={cx('tab', { active: tab === 'hcm_hoanghoatham' })}
                            onClick={() => setTab('hcm_hoanghoatham')}
                        >
                            🌆 HCM - Hoàng Hoa Thám
                        </div>
                        <div
                            className={cx('tab', { active: tab === 'hcm_khavancan' })}
                            onClick={() => setTab('hcm_khavancan')}
                        >
                            🏬 HCM - Kha Vạn Cân
                        </div>
                        <div
                            className={cx('tab', { active: tab === 'hcm_tranhungdao' })}
                            onClick={() => setTab('hcm_tranhungdao')}
                        >
                            🏢 HCM - Trần Hưng Đạo
                        </div>
                    </div>

                    <div className={cx('mapContainer', { fade })}>
                        {loading ? (
                            <LoadingSpinner /> // 👈 hiển thị khi đang load
                        ) : (
                            <iframe
                                title="map"
                                src={maps[tab]}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                    </div>

                    {/* Thông tin cửa hàng */}
                    <div className={cx('storeInfo', { fade })}>
                        <p>{info[tab].address}</p>
                        <p>{info[tab].phone}</p>
                        <p>{info[tab].time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
