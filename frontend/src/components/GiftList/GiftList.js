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
            {gifts.map((gift, i) => {
                const g = typeof gift === 'string' ? { _id: gift, title: gift } : gift || {};

                return (
                    <div key={g._id || i} className={cx('gift-block')}>
                        {/* ✅ Icon + Title Gift */}
                        <h3 className={cx('gift-header')}>
                            <FontAwesomeIcon icon={faGift} className={cx('gift-icon')} />{' '}
                            {g.title || g.name || `Quà tặng ${i + 1}`}
                        </h3>

                        {/* Danh sách sản phẩm trong gift */}
                        {Array.isArray(g.products) && g.products.length > 0 && (
                            <ul className={cx('gift-products')}>
                                {g.products.map((item, idx) => {
                                    const prod = item.productId || item;
                                    const prodName = prod?.name || item.productName || prod?._id || 'Sản phẩm';
                                    const qty = item.quantity || 1;
                                    const price = item.finalPrice ?? prod?.price;

                                    return (
                                        <li key={prod?._id || idx} className={cx('gift-product-item')}>
                                            <span className={cx('gift-index')}>{idx + 1}.</span>{' '}
                                            <span className={cx('gift-prod-name')}>{prodName}</span>
                                            <span className={cx('gift-prod-meta')}>
                                                {' '}
                                                x{qty}
                                                {price != null && <> • {Number(price).toLocaleString()}₫</>}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default GiftList;
