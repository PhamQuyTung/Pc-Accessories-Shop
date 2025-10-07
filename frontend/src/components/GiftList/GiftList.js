import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import styles from './GiftList.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function GiftList({ gifts }) {
    if (!gifts || gifts.length === 0) return null;

    return (
        <div className={cx('gift-box')}>
            {gifts.map((gift, i) => {
                const g = typeof gift === 'string' ? { _id: gift, title: gift } : gift || {};
                console.log("🎁 gift data:", g);

                return (
                    <div key={g._id || i} className={cx('gift-block')}>
                        {/* ✅ Title */}
                        <div className={cx('gift-header')}>
                            <FontAwesomeIcon icon={faGift} className={cx('gift-icon')} />
                            <span className={cx('gift-title')}>{g.title || g.name || `Quà tặng ${i + 1}`}</span>
                        </div>

                        {/* Danh sách quà */}
                        {Array.isArray(g.products) && g.products.length > 0 && (
                            <ul className={cx('gift-products')}>
                                {g.products.map((item, idx) => {
                                    const prod = item.productId || item;
                                    const prodName = prod?.name || item.productName || prod?._id || 'Sản phẩm';
                                    const qty = item.quantity || 1;
                                    const price = item.finalPrice ?? prod?.price ?? 0;
                                    const totalPrice = price * qty;

                                    return (
                                        <li key={prod?._id || idx} className={cx('gift-product-item')}>
                                            <Link to={prod?.slug ? `/products/${prod.slug}` : '#'} className={cx('gift-product-link')}>
                                                <span className={cx('gift-index')}>{idx + 1}</span>
                                                <span className={cx('gift-text')}>
                                                    Tặng ngay{' '}
                                                    <span className={cx('highlight')}>
                                                        {qty} x {prodName}
                                                    </span>{' '}
                                                    trị giá{' '}
                                                    <span className={cx('highlight')}>
                                                        {Number(totalPrice).toLocaleString()}₫
                                                    </span>
                                                </span>
                                            </Link>
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
