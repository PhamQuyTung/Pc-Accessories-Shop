import styles from './SubHeader.module.scss';
import classNames from 'classnames/bind';
import useScrollVisibility from '../../hooks/useScrollVisibility';

const cx = classNames.bind(styles);

function SubHeader() {
    const visible = useScrollVisibility(); // 👈 cùng hook

    const links = [
        { title: 'Mua PC tặng màn 240Hz', href: '#' },
        { title: 'Hot Deal Laptop', href: '#' },
        { title: 'Tin tức', href: '#' },
        { title: 'Dịch vụ kỹ thuật tại nhà', href: '#' },
        { title: 'Thu cũ đổi mới', href: '#' },
        { title: 'Tra cứu bảo hành', href: '#' },
    ];

    return (
        <div className={cx('subHeader', { hidden: !visible })}>
            <div className={cx('container')}>
                {links.map((item, index) => (
                    <a key={index} href={item.href} className={cx('link')}>
                        {item.title}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default SubHeader;
