import React from 'react';
import cx from 'classnames';
import styles from './ProductActions.module.scss';

const ProductActions = ({ isAddingToCart, product, activeVariation, onAddToCart }) => {
    const isOutOfStock = activeVariation && Number(activeVariation.quantity) === 0;

    const isDisabled = isAddingToCart || !activeVariation || isOutOfStock;

    return (
        <div className={styles.actionsWrapper}>
            <button className={cx(styles.addToCart)} onClick={onAddToCart} disabled={isDisabled}>
                <span className={styles.mainText}>MUA NGAY</span>
                <span className={styles.subText}>Giao tận nơi/Nhận tại cửa hàng</span>
            </button>

            <button className={styles.chatNow}>
                <span className={styles.mainText}>TƯ VẤN NGAY</span>
                <span className={styles.subText}>Đưa ra đánh giá nhanh, chính xác</span>
            </button>
        </div>
    );
};

export default ProductActions;
