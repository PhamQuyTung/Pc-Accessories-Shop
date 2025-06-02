import styles from './CF-Slider.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function CFSlider() {
    return (
        <div className={cx('CFSlider')}>
            <div className={cx('CFSlider-content')}>CFSlider</div>
        </div>
    )
}

export default CFSlider;
