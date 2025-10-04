// src/components/Product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.scss';
import classNames from 'classnames/bind';
import { FireIcon, GiftIcon } from '../Icons/Icons';
import BasicRating from '~/components/Rating/Rating';

const cx = classNames.bind(styles);

function ProductCard({ product, viewMode }) {
    if (!product) return null;

    // console.log('Product:', product);

    return (
        <div className={cx('product-card', viewMode === 'list' ? 'list-mode' : 'grid-mode')}>
            <div className={cx('proloop-label--bottom')}>
                {/* Quà tặng HOT */}
                {typeof product.status === 'string' && product.status.includes('quà tặng') && (
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

            <div className={cx('product-card__info')}>
                <div className={cx('proloop-label--bottom')}>
                    {(() => {
                        switch (product.status?.trim()) {
                            case 'sản phẩm mới':
                                return <span className={cx('new-tag')}>Sản phẩm mới</span>;
                            case 'hàng rất nhiều':
                                return <span className={cx('very-many-tag')}>Hàng rất nhiều</span>; // 👈 Thêm dòng này
                            case 'nhiều hàng':
                                return <span className={cx('many-tag')}>Nhiều hàng</span>;
                            case 'còn hàng':
                                return <span className={cx('in-stock')}>Còn hàng</span>;
                            case 'sắp hết hàng':
                                return <span className={cx('low-stock')}>Sắp hết hàng</span>;
                            case 'hết hàng':
                                return <span className={cx('out-stock')}>Hết hàng</span>;
                            case 'đang nhập hàng':
                                return <span className={cx('importing-tag')}>Đang nhập hàng</span>;
                            default:
                                return null;
                        }
                    })()}

                    {/* Bán chạy */}
                    {product.isBestSeller && (
                        <span className={cx('bestseller-tag')}>
                            <FireIcon className={cx('icon-fire')} />
                            <span className={cx('bestseller-label')}>Bán chạy</span>
                        </span>
                    )}
                </div>

                <div className={cx('product-card__des')}>
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>

                    {typeof product.specs === 'object' &&
                        Object.values(product.specs || {}).some(
                            (value) => typeof value === 'string' && value.trim(),
                        ) && (
                            <div className={cx('specs')}>
                                {Object.values(product.specs || {})
                                    .filter((value) => typeof value === 'string' && value.trim())
                                    .map((value, index, array) => (
                                        <span key={index}>
                                            {value}
                                            {index < array.length - 1 && <span className={cx('separator')}> | </span>}
                                        </span>
                                    ))}
                            </div>
                        )}

                    <div className={cx('price')}>
                        {product.discountPrice && product.discountPrice < product.price ? (
                            <>
                                <div className={cx('price-wrap1')}>
                                    <span className={cx('original-price')}>{product.price.toLocaleString()}₫</span>
                                </div>
                                <div className={cx('price-wrap2')}>
                                    <span className={cx('discount-price')}>
                                        {product.discountPrice.toLocaleString()}₫
                                    </span>
                                    <span className={cx('discount-percent')}>
                                        -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className={cx('price-wrap2')}>
                                <span className={cx('discount-price')}>{product.price.toLocaleString()}₫</span>
                            </div>
                        )}
                    </div>

                    {/* Rating Star */}
                    <div className={cx('rating')}>
                        <BasicRating value={product.averageRating || 0} />
                        <span className={cx('rating-count')}>({product.reviewCount || 0} đánh giá)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
