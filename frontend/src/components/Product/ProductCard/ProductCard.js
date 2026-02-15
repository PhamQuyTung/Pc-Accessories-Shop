// src/components/Product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.scss';
import classNames from 'classnames/bind';
import { FireIcon, GiftIcon } from '../../Icons/Icons';
import BasicRating from '~/components/Rating/Rating';
import { getDefaultDisplayName } from '~/utils/getDefaultDisplayName';
import { getCardSpecs } from '~/utils/getCardSpecs';
import { SPEC_ICON_MAP } from '~/constants/specIcons';

const cx = classNames.bind(styles);

function ProductCard({ product, viewMode }) {
    const promotionFrame = product?.promotionInfo?.promotionCardImg;

    console.log('PROMO:', product.name, product.promotionInfo);

    if (!product) return null;
    console.log('PRODUCT CARD DATA:', product);

    // ===========================
    // 1) Lấy biến thể mặc định
    // ===========================
    const defaultVariant =
        product?.variations?.find((v) => v._id?.toString() === product.defaultVariantId?.toString()) ||
        product?.variations?.[0] ||
        null;

    // Trường hợp sản phẩm không có biến thể → fallback về dữ liệu product
    const display = defaultVariant || product;

    // ===========================
    // 2) Lấy ảnh hiển thị
    // ===========================
    const thumbnail =
        defaultVariant?.images?.[0] || defaultVariant?.thumbnail || product?.images?.[0] || '/placeholder.png';

    // ===========================
    // 3) Lấy giá hiển thị
    // ===========================
    const price = display?.price ?? product.price ?? 0;
    const discountPrice = display?.discountPrice ?? product.discountPrice ?? null;

    // ===========================
    // 4) Lấy specs hiển thị
    // ===========================
    const cardSpecs = getCardSpecs(product, defaultVariant, 4);

    console.log('DEFAULT VARIANT:', defaultVariant);
    console.log('PRODUCT SPECS:', product.specs);
    console.log('CARD SPECS:', cardSpecs);
    console.log('CATEGORY DATA:', product.category);

    return (
        <div className={cx('product-card', viewMode === 'list' ? 'list-mode' : 'grid-mode')}>
            {/* ----- TAG QUÀ TẶNG HOT ----- */}
            {/* <div className={cx('proloop-label--bottom')}>
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

                {Array.isArray(product.gifts) && product.gifts.length > 0 && (
                    <span className={cx('gift-badge')}>
                        <GiftIcon className={cx('icon-gift-small')} />
                    </span>
                )}
            </div> */}

            {/* ----- HÌNH ẢNH ----- */}
            <div className={cx('product-card__image')}>
                {promotionFrame && <img src={promotionFrame} alt="promotion-frame" className={cx('promotion-frame')} />}

                <Link to={`/products/${product.slug}?vid=${display._id}`}>
                    <img src={thumbnail} alt={product.name} />
                </Link>
            </div>

            {/* ----- TAG TRẠNG THÁI (Hàng mới, còn hàng...) ----- */}
            <div className={cx('proloop-label--bottom')}>
                {(() => {
                    switch (product.status?.trim()) {
                        case 'sản phẩm mới':
                            return <span className={cx('new-tag')}>Sản phẩm mới</span>;
                        case 'hàng rất nhiều':
                            return <span className={cx('very-many-tag')}>Hàng rất nhiều</span>;
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

                {product.isBestSeller && (
                    <span className={cx('bestseller-tag')}>
                        <FireIcon className={cx('icon-fire')} />
                        <span className={cx('bestseller-label')}>Bán chạy</span>
                    </span>
                )}
            </div>

            {/* ----- TÊN SẢN PHẨM ----- */}
            <div className={cx('product-card__des')}>
                <Link to={`/products/${product.slug}?vid=${display._id}`}>{getDefaultDisplayName(product)}</Link>

                {/* HIỂN THỊ SPEC CỦA BIẾN THỂ */}
                <div className={cx('proloop-label--bottom', 'proloop-label--bottom2')}>
                    {cardSpecs.length > 0 && (
                        <ul className={cx('spec-list')}>
                            {cardSpecs.map((spec) => {
                                const Icon = SPEC_ICON_MAP[spec.icon];

                                return (
                                    <li key={spec.key} className={cx('spec-item')}>
                                        {Icon && <Icon className={cx('spec-icon')} />}
                                        <span>{spec.value}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* GIÁ */}
                <div className={cx('price')}>
                    {discountPrice && discountPrice < price ? (
                        <>
                            <div className={cx('price-wrap1')}>
                                <span className={cx('original-price')}>{price.toLocaleString()}₫</span>
                            </div>
                            <div className={cx('price-wrap2')}>
                                <span className={cx('discount-price')}>{discountPrice.toLocaleString()}₫</span>
                                <span className={cx('discount-percent')}>
                                    -{Math.round((1 - discountPrice / price) * 100)}%
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className={cx('price-wrap2')}>
                            <span className={cx('discount-price')}>{price.toLocaleString()}₫</span>
                        </div>
                    )}
                </div>

                {/* RATING */}
                <div className={cx('rating')}>
                    <BasicRating value={product.averageRating || 0} />
                    <span className={cx('rating-count')}>({product.reviewCount || 0} đánh giá)</span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
