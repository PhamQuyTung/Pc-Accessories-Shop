import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './UpToTop.module.scss';

const cx = classNames.bind(styles);

const UpToTop = ({ scrollThreshold = 300, smooth = true, size = 24 }) => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollTop / docHeight) * 100;
            setProgress(scrollProgress);
            setVisible(scrollTop > scrollThreshold);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollThreshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto',
        });
    };

    // Dùng cùng kích thước với SCSS để SVG luôn đồng tâm
    const circleRadius = 20;
    const circumference = 2 * Math.PI * circleRadius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <button className={cx('upToTop', { show: visible })} onClick={scrollToTop} aria-label="Scroll to top">
            <svg className={cx('progressCircle')} viewBox="0 0 48 48">
                <circle className={cx('bg')} cx="24" cy="24" r={circleRadius} />
                <circle
                    className={cx('progress')}
                    cx="24"
                    cy="24"
                    r={circleRadius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <ArrowUp size={size} className={cx('icon')} />
        </button>
    );
};

export default UpToTop;
