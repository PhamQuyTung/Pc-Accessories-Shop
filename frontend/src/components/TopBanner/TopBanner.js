import React, { useState } from 'react';
import styles from './TopBanner.module.scss';
import classNames from 'classnames/bind';
import { X } from 'lucide-react';
import TopBanner1 from '../../assets/images/TopBanner/gearvn-pc-gvn-t9-top-bar.png'

const cx = classNames.bind(styles);

function TopBanner() {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    return (
        <div className={cx('top-banner')}>
            <div className={cx('content')}>
                <img
                    src={TopBanner1}
                    alt="Banner khuyến mãi"
                    className={cx('banner-image')}
                />
                <button className={cx('close-btn')} onClick={() => setVisible(false)}>
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

export default TopBanner;
