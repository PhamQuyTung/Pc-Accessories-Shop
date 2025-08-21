import React from 'react';
import classNames from 'classnames/bind';
import styles from './PromoCard.module.scss';
import ProductCard from '~/components/Product/ProductCard';

const cx = classNames.bind(styles);

export default function PromoCard({ product }) {
    return (
        <div className={cx('card')}>
            {/* <div className={cx('card-header')}>
                <span className={cx('deal-text')}>DEAL HỔNG ĐIÊU</span>
                <span className={cx('time')}>18.8 - 24.8</span>
            </div>
            <div className={cx('card-image')}>
                <img src="https://product.hstatic.net/200000722513/product/co_khong_day_akko_mod_007b_he_pc_joy_of_life_rgb_hotswap__akko_sw__-_5_6b40f805dd2d4c8fb765bf365b50d838_master.png" alt={product.name} />
            </div>
            <div className={cx('card-body')}>
                <h4 className={cx('name')}>{product.name}</h4>
                <div className={cx('price-box')}>
                    <span className={cx('old-price')}>{product.oldPrice}₫</span>
                    <span className={cx('new-price')}>{product.newPrice}₫</span>
                    <span className={cx('discount')}>-25%</span>
                </div>
                <div className={cx('rating')}>⭐ 0.0 (0 đánh giá)</div>
                <div className={cx('sold')}>🔥 Đã bán: {product.sold}</div>
            </div> */}
            <ProductCard />
        </div>
    );
}
