import React from 'react';
import cx from 'classnames';
import styles from './PriceDisplay.module.scss';

const PriceDisplay = ({ activeVariation, product }) => {
    const priceData = activeVariation || product;
    const { price, discountPrice } = priceData;

    const discountPercent = discountPrice && price ? Math.round(((price - discountPrice) / price) * 100) : null;

    return (
        <div className={cx(styles.productInfoCost)}>
            {discountPrice ? (
                <>
                    <p className={cx(styles.productInfoDiscountPrice)}>{discountPrice?.toLocaleString() ?? '0'}₫</p>
                    <p className={cx(styles.productInfoPrice)}>{price?.toLocaleString() ?? '0'}₫</p>
                    {discountPercent && (
                        <span className={cx(styles.productInfoDiscountPercent)}>-{discountPercent}%</span>
                    )}
                </>
            ) : (
                <p className={cx(styles.productInfoDiscountPrice)}>{price?.toLocaleString() ?? '0'}₫</p>
            )}
        </div>
    );
};

export default PriceDisplay;
