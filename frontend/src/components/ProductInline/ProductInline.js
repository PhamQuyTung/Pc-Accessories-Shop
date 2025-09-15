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
                    <p className={cx('price')}>{product.price.toLocaleString('vi-VN')}₫</p>
                </div>
            </Link>
        </div>
    );
};

export default ProductInline;
