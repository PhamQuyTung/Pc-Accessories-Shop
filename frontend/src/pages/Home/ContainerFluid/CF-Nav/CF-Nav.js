import styles from './CF-Nav.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function CFNav() {
    return (
        <div className={cx('CFNav')}>
            <div className={cx('CFNav-content')}>CFNav</div>
        </div>
    )
}

export default CFNav;
