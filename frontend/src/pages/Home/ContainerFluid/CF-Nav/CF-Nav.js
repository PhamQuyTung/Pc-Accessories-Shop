import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './CF-Nav.module.scss';
import classNames from 'classnames/bind';
import { faAngleRight, faArrowRight, faDisplay, faHeadphones, faLaptop, faMouse } from '@fortawesome/free-solid-svg-icons';
import { faKeyboard } from '@fortawesome/free-regular-svg-icons';
import { LapTopIcon, LapTopGamingIcon, KeyBoardIcon, MouseIcon, HeadPhoneIcon, CharIcon } from '~/components/Icons';

const cx = classNames.bind(styles);

const listNavigation = [
    {   
        icon: <LapTopIcon/>,
        label: 'Laptop',
    },
    {   
        icon: <LapTopGamingIcon/>,
        label: 'Màn hình',
    },
    {   
        icon: <KeyBoardIcon/>,
        label: 'Bàn phím',
    },
    {   
        icon: <MouseIcon/>,
        label: 'Chuột + Lót chuột',
    },
    {   
        icon: <HeadPhoneIcon/>,
        label: 'Tai nghe',
    },
    {   
        icon: <CharIcon/>,
        label: 'Ghế - Bàn',
    },
];

function CFNav() {
    return (
        <div className={cx('CFNav')}>
            <div className={cx('CFNav-wrap')}>
                <ul className={cx('CFNav-list')}>
                    {listNavigation.map((item, index) => (
                        <li key={index} className={cx('CFNav-item')}>
                            <div className={cx('CFNav-item__wrap')}>
                                <span className={cx('CFNav-boxIcon')}>{item.icon}</span>
                                <span className={cx('CFNav-label')}>{item.label}</span>
                            </div>
                            <span className={cx('arrow-right')}>
                                <FontAwesomeIcon icon={faAngleRight} />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CFNav;
