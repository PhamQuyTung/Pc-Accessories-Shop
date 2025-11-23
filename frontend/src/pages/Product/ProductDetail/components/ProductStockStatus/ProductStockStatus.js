import React from 'react';
import cx from 'classnames';
import styles from './ProductStockStatus.module.scss';

const ProductStockStatus = ({ activeVariation, product, getVariationStatus }) => {
    const statusText = activeVariation
        ? getVariationStatus(activeVariation)
        : product?.status || 'Không có';

    const badgeClass = (() => {
        switch (statusText) {
            case 'sản phẩm mới':
                return styles.badgeNew;
            case 'nhiều hàng':
                return styles.badgeMany;
            case 'còn hàng':
                return styles.badgeInstock;
            case 'sắp hết hàng':
                return styles.badgeLow;
            case 'hết hàng':
                return styles.badgeOut;
            case 'đang nhập hàng':
                return styles.badgeImporting;
            default:
                return styles.badgeDefault;
        }
    })();

    return (
        <div className={styles.statusWrapper}>
            <span className={cx(styles.statusBadge, badgeClass)}>{statusText}</span>
        </div>
    );
};

export default ProductStockStatus;
