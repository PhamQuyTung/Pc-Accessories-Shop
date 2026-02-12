import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './RecentlyViewed.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function RecentlyViewed() {
    const [products, setProducts] = useState([]);
    const listRef = useRef(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        setProducts(stored);
    }, []);

    if (!products.length) return null;

    const scroll = (direction) => {
        if (!listRef.current) return;

        const scrollAmount = 260; // chiều rộng 1 card + gap

        listRef.current.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Sản phẩm đã xem</h2>

                {/* 🔥 NAV BUTTON */}
                <div className={cx('nav')}>
                    <button onClick={() => scroll('prev')}>&lt;</button>
                    <button onClick={() => scroll('next')}>&gt;</button>
                </div>
            </div>

            <div ref={listRef} className={cx('list')}>
                {products.map((item) => {
                    const hasDiscount = item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price;

                    const finalPrice = hasDiscount
                        ? item.discountPrice
                        : item.promotionApplied?.percent
                          ? Math.round(item.price * (1 - item.promotionApplied.percent / 100))
                          : item.price;

                    const discountPercent =
                        finalPrice < item.price ? Math.round(((item.price - finalPrice) / item.price) * 100) : 0;

                    return (
                        <Link key={item._id} to={`/products/${item.slug}`} className={cx('card')}>
                            {discountPercent > 0 && <div className={cx('discountBadge')}>-{discountPercent}%</div>}

                            <div className={cx('image')}>
                                <img src={item.thumbnail} alt={item.name} />
                            </div>

                            <div className={cx('info')}>
                                <p className={cx('name')}>{item.name}</p>

                                <div className={cx('price')}>
                                    <span className={cx('new')}>{finalPrice?.toLocaleString()}đ</span>

                                    {finalPrice < item.price && (
                                        <span className={cx('old')}>{item.price?.toLocaleString()}đ</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default RecentlyViewed;
