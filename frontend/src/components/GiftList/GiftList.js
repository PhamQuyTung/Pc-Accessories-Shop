import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import styles from './GiftList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function GiftList({ gifts }) {
    if (!gifts || gifts.length === 0) return null;

    return (
        <div className={cx('gift-box')}>
            <h3 className={cx('gift-title')}>
                <FontAwesomeIcon icon={faGift} className={cx('gift-icon')} /> Quà tặng khuyến mãi
            </h3>
            <ul className={cx('gift-list')}>
                {gifts.map((gift, i) => (
                    <li key={gift.id || i} className={cx('gift-item')}>
                        🎁 {i + 1}. {gift.name}{' '}
                        {gift.value && (
                            <span className={cx('gift-value')}>(Trị giá: {gift.value.toLocaleString()}₫)</span>
                        )}
                        {gift.quantity > 1 && <span className={cx('gift-qty')}> x{gift.quantity}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GiftList;
