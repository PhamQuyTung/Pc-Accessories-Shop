import React, { useState, useEffect } from 'react';
import styles from './TopBanner.module.scss';
import classNames from 'classnames/bind';
import TopBanner1 from '../../assets/images/TopBanner/gearvn-back-to-school-25-topbar.png';

const cx = classNames.bind(styles);

function TopBanner() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setVisible(false);
                document.body.classList.add('banner-hidden'); // 👈 thêm class vào body
            } else {
                setVisible(true);
                document.body.classList.remove('banner-hidden'); // 👈 gỡ class
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={cx('top-banner', { hidden: !visible })}>
            <div className={cx('content')}>
                <img src={TopBanner1} alt="Banner khuyến mãi" className={cx('banner-image')} />
            </div>
        </div>
    );
}

export default TopBanner;
