import styles from './CF-Slider.module.scss';
import classNames from 'classnames/bind';
import Banner1 from '~/assets/images/Slider/Banner1.webp';
import Banner2 from '~/assets/images/Slider/Banner2.webp';
import Banner3 from '~/assets/images/Slider/Banner3.webp';
import Banner4 from '~/assets/images/Slider/Banner4.webp';
import Banner5 from '~/assets/images/Slider/Banner5.webp';
import Banner6 from '~/assets/images/Slider/Banner6.webp';

const cx = classNames.bind(styles);

function CFSlider() {
    return (
        <div className={cx('CFSlider')}>
            <div className={cx('CFSlider-wrap')}>
                <div className={cx('div15')}>
                    <img src={Banner1} alt='Banner1' />
                </div>
                <div className={cx('div2')}>
                    <img src={Banner2} alt='Banner2' />
                </div>
                <div className={cx('div3')}>
                    <img src={Banner3} alt='Banner3' />
                </div>
                <div className={cx('div13')}>
                    <img src={Banner4} alt='Banner4' />
                </div>
                <div className={cx('div14')}>
                    <img src={Banner5} alt='Banner5' />
                </div>
                <div className={cx('div4')}>
                    <img src={Banner6} alt='Banner6' />
                </div>
            </div>
        </div>
    );
}

export default CFSlider;
