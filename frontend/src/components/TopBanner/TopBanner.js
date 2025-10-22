import React from 'react';
import styles from './TopBanner.module.scss';
import classNames from 'classnames/bind';
import TopBanner1 from '../../assets/images/TopBanner/gearvn-back-to-school-25-topbar.png';
import useScrollVisibility from '../../hooks/useScrollVisibility';

const cx = classNames.bind(styles);

function TopBanner() {
    const visible = useScrollVisibility(); // 👈 dùng chung hook

    return (
        <div className={cx('top-banner', { hidden: !visible })}>
            <div className={cx('content')}>
                <img src={TopBanner1} alt="Banner khuyến mãi" className={cx('banner-image')} />
            </div>
        </div>
    );
}

export default TopBanner;
