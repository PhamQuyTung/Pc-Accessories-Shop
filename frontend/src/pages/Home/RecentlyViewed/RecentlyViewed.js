import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './RecentlyViewed.module.scss';
import { Link } from 'react-router-dom';
import axiosClient from '../../../utils/axiosClient';

const cx = classNames.bind(styles);

function RecentlyViewed() {
    const [products, setProducts] = useState([]);
    const listRef = useRef(null);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const res = await axiosClient.get('/accounts/me/recently-viewed');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRecentlyViewed();
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
                    const defaultVariant = item.variations?.find((v) => v._id === item.defaultVariantId);

                    const basePrice = defaultVariant?.price || item.price;
                    const discountPrice = defaultVariant?.discountPrice ?? item.discountPrice ?? 0;

                    const hasDiscount =
                        typeof discountPrice === 'number' && discountPrice > 0 && discountPrice < basePrice;

                    const finalPrice = hasDiscount ? discountPrice : basePrice;

                    const discountPercent = hasDiscount ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0;

                    const image =
                        defaultVariant?.thumbnail || defaultVariant?.images?.[0] || item.images?.[0] || '/no-image.png';

                    return (
                        <Link key={item._id} to={`/products/${item.slug}`} className={cx('card')}>
                            {discountPercent > 0 && <div className={cx('discountBadge')}>-{discountPercent}%</div>}

                            <div className={cx('image')}>
                                <img src={image} alt={item.name} />
                            </div>

                            <div className={cx('info')}>
                                <p className={cx('name')}>{item.name}</p>

                                <div className={cx('price')}>
                                    <span className={cx('new')}>{finalPrice?.toLocaleString()}đ</span>

                                    {hasDiscount && <span className={cx('old')}>{basePrice?.toLocaleString()}đ</span>}
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
