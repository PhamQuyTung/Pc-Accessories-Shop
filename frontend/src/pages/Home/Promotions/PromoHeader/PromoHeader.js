// components/Promotions/PromoHeader.js
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './PromoHeader.module.scss';
import { Clock } from 'lucide-react';

const cx = classNames.bind(styles);

export default function PromoHeader({ title, endTime, detailHref }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!endTime) return;
        const interval = setInterval(() => {
            const diff = new Date(endTime) - new Date();
            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className={cx('promo-header')}>
            <div className={cx('header')}>
                <span className={cx('label')}>deal 0?! khổng điêu</span>
                <span className={cx('date')}>18.8 - 24.8</span>
            </div>
            <div className={cx('title')}>
                <Clock className={cx('icon')} />
                <h2>{title}</h2>
            </div>
            <div className={cx('countdown')}>
                {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
                <span>{timeLeft.hours}h</span>
                <span>{timeLeft.minutes}m</span>
                <span>{timeLeft.seconds}s</span>
            </div>
            {detailHref && (
                <a href={detailHref} className={cx('detail-link')}>
                    Xem chi tiết
                </a>
            )}
        </div>
    );
}
