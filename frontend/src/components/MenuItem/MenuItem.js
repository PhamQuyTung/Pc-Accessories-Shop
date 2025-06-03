import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './MenuItem.module.scss';
import { formatLabelToPath } from '~/utils/formatLabelToPath';

const cx = classNames.bind(styles);

function MenuItem({ item, parentPath = '' }) {
    // Tạo path từ label nếu chưa có
    const labelPath = formatLabelToPath(item.label);
    const currentPath = item.path || `${parentPath}/${labelPath}`;

    return (
        <li className={cx('CFNav-item')}>
            <div className={cx('CFNav-item__wrap')}>
                <Link to={currentPath} className={cx('CFNav-link')}>
                    <span className={cx('CFNav-boxIcon')}>{item.icon}</span>
                    <span className={cx('CFNav-label')}>{item.label}</span>
                </Link>
            </div>

            {item.children && (
                <>
                    <span className={cx('arrow-right')}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </span>
                    <ul className={cx('CFNav-submenu')}>
                        {item.children.map((child, idx) => (
                            <MenuItem key={idx} item={child} parentPath={currentPath} />
                        ))}
                    </ul>
                </>
            )}
        </li>
    );
}

export default MenuItem;
