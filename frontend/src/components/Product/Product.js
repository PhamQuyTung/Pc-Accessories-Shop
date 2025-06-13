// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Product.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Product() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/products')
            .then((res) => setProducts(res.data))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className={cx('product-grid')}>
            {products.map((product) => (
                <div key={product._id} className={cx('product-card')}>
                    <img src={product.image} alt={product.name} />
                    <h3>{product.name}</h3>

                    <div className={cx('price')}>
                        <span className={cx('discount-price')}>{product.discountPrice.toLocaleString()}₫</span>
                        <span className={cx('original-price')}>{product.price.toLocaleString()}₫</span>
                        <span className={cx('discount-percent')}>
                            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                        </span>
                    </div>

                    <div className={cx('specs')}>
                        <span>{product.specs.cpu}</span> | <span>{product.specs.vga}</span> |{' '}
                        <span>{product.specs.ssd}</span>
                    </div>

                    <div className={cx('status')}>
                        {product.status.includes('mới') && <span className={cx('new-tag')}>Sản phẩm mới</span>}
                        {product.status.includes('quà tặng') && <span className={cx('gift-tag')}>🎁 Quà tặng HOT</span>}
                        {product.status.includes('bán chạy') && <span className={cx('hot-tag')}>🔥 Bán chạy</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Product;
