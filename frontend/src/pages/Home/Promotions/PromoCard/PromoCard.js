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

    // 👉 Dùng trực tiếp các field đã normalize từ BE
    const price = product.price || 0;
    const promotionPrice = product.promotionPrice || price;
    const discountPercent = product.discountPercent || 0;
    // Lấy đúng field từ BE trả về
    const stock = product?.quantity ?? null;
    const soldCount = product?.promotionApplied?.soldCount ?? 0;
    // Tính % tiến trình bán hàng
    const total = soldCount + stock;
    const progressPercent = total > 0 ? Math.min((soldCount / total) * 100, 100) : 0;

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

                {/* Thanh tiến trình bán hàng */}
                <div className={cx('progress-wrapper')}>
                    <div className={cx('progress-bar')} style={{ width: `${progressPercent}%` }}></div>
                    <span className={cx('progress-label')}>
                        {stock <= 0 ? 'Hết hàng' : soldCount === 0 ? 'Vừa mở bán' : `Đã bán ${soldCount}`}
                    </span>
                </div>
            </div>
        </div>
    );
}
