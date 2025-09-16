// ~/components/ProductInline/ProductInline.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductInline.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ProductInline = ({ product }) => {
    if (!product) return null;
    return (
        <div className={cx('product-inline')}>
            <Link to={`/products/${product.slug}`} className={cx('wrapper')}>
                <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className={cx('product-thumb')}
                />
                <div className={cx('info')}>
                    <h4>{product.name}</h4>

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

                    <button className={cx('btn-more')}>Xem thêm</button>
                </div>
            </Link>
        </div>
    );
};

export default ProductInline;
