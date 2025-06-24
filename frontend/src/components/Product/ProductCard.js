// src/components/Product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.scss';
import classNames from 'classnames/bind';
import { FireIcon, GiftIcon } from '../Icons/Icons';
import RatingComponent from '../Rating/Rating';

const cx = classNames.bind(styles);

function ProductCard({ product }) {
    if (!product) return null;

    return (
        <div className={cx('product-card')}>
            <div className={cx('proloop-label--bottom')}>
                {product.status.includes('quà tặng') && (
                    <span className={cx('gift-tag')}>
                        <div className={cx('gift-tag__hot')}>
                            <FireIcon className={cx('icon-fire')} />
                            Quà tặng HOT
                        </div>
                        <div className={cx('gift-tag__box')}>
                            <GiftIcon className={cx('icon-gift')} />
                        </div>
                    </span>
                )}
            </div>

            <Link to={`/products/${product.slug}`}>
                <img src={product.images?.[0]} alt={product.name} />
            </Link>

            <div className={cx('proloop-label--bottom')}>
                {product.status.includes('mới') && <span className={cx('new-tag')}>Sản phẩm mới</span>}
            </div>

            <div>{product.status.includes('còn hàng') && <span className={cx('in-stock')}>Còn hàng</span>}</div>

            <div>{product.status.includes('hết hàng') && <span className={cx('out-stock')}>Hết hàng</span>}</div>

            <div className={cx('product-card__des')}>
                <Link to={`/products/${product.slug}`}>{product.name}</Link>

                <div className={cx('specs')}>
                    <span>{product.specs.cpu}</span> | <span>{product.specs.vga}</span> |{' '}
                    <span>{product.specs.ssd}</span> | <span>{product.specs.mainboard}</span> |{' '}
                    <span>{product.specs.ram}</span>
                </div>

                <div className={cx('price')}>
                    <div className={cx('price-wrap1')}>
                        <span className={cx('original-price')}>{product.price.toLocaleString()}₫</span>
                    </div>
                    <div className={cx('price-wrap2')}>
                        <span className={cx('discount-price')}>{product.discountPrice.toLocaleString()}₫</span>
                        <span className={cx('discount-percent')}>
                            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Rating Star */}
                <div className={cx('rating')}>
                    <RatingComponent />
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
