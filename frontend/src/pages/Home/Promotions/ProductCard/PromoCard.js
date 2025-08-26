// src/components/ProductCard/PromoCard.js
import React from 'react';
import styles from './PromoCard.module.scss';
import classNames from 'classnames/bind';
import { normalizeImageUrl } from '~/utils/normalizeImageUrl';
import { faStar as solidStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

    // Giả sử product.rating là số điểm trung bình (VD: 4.5)
    const rating = product.rating || 0;
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

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
                <h3 className={cx('name')}>{name}</h3>

                <div className={cx('price-wrapper')}>
                    <div className={cx('prices')}>
                        <span className={cx('price-sale')}>{promotionPrice.toLocaleString()}₫</span>
                        {promotionPrice < price && <span className={cx('price-original')}>{price.toLocaleString()}₫</span>}
                    </div>
                    {discountPercent > 0 && <span className={cx('discount-badge')}>-{discountPercent}%</span>}
                </div>

                {/* Đánh giá sao */}
                <div className={cx('rating')}>
                    {[...Array(fullStars)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={solidStar} color="#FFD700" />
                    ))}
                    {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} color="#FFD700" />}
                    {[...Array(maxStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                        <FontAwesomeIcon key={i + fullStars + 1} icon={regularStar} color="#FFD700" />
                    ))}
                    <span className={cx('rating-value')}>{rating.toFixed(1)}</span>
                </div>

                <div className={cx('status')}>Vừa mở bán</div>
            </div>
        </div>
    );
}
