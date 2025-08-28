// src/components/ProductCard/PromoCard.js
import React from 'react';
import styles from './PromoCard.module.scss';
import classNames from 'classnames/bind';
import { normalizeImageUrl } from '~/utils/normalizeImageUrl';
import BasicRating from '~/components/Rating/Rating';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function PromoCard({ product, promotionCardImg }) {
    if (!product) return null;

    const name = product.name || 'Sản phẩm';
    const image = normalizeImageUrl(
        product.images?.[0] || product.image || product.thumbnail || '/default-product.jpg',
    );
    const price = product.price || 0;
    const promotionPrice = product.discountPrice || product.promotionPrice || price;
    const discountPercent =
        product.discountPercent || (price > 0 ? Math.round(((price - promotionPrice) / price) * 100) : 0);

    return (
        <div className={cx('promo-card')}>
            {/* Khung + ảnh sản phẩm */}
            <div className={cx('frame-wrapper')}>
                <img src={normalizeImageUrl(promotionCardImg)} alt="Khung CTKM" className={cx('frame-bg')} />
                <div className={cx('product-wrapper')}>
                    <img src={image} alt={name} className={cx('product-image')} />
                </div>
            </div>

            {/* Info */}
            <div className={cx('info')}>
                <Link className={cx('link')} to={`/products/${product.slug}`}>
                    <h3 className={cx('name')}>{name}</h3>
                </Link>

                <div className={cx('price-wrapper')}>
                    <div className={cx('prices')}>
                        <span className={cx('price-sale')}>{promotionPrice.toLocaleString()}₫</span>
                        {promotionPrice < price && (
                            <span className={cx('price-original')}>{price.toLocaleString()}₫</span>
                        )}
                    </div>
                    {discountPercent > 0 && <span className={cx('discount-badge')}>-{discountPercent}%</span>}
                </div>

                {/* Đánh giá sao */}
                <div className={cx('rating')}>
                    <BasicRating value={product.averageRating || 0} />
                    <span className={cx('rating-count')}>({product.reviewCount || 0} đánh giá)</span>
                </div>

                <div className={cx('status')}>Vừa mở bán</div>
            </div>
        </div>
    );
}
