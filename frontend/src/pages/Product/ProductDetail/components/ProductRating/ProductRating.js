import React from 'react';
import styles from './ProductRating.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function ProductRating({ averageRating, reviewCount, onClickRatings }) {
    return (
        <div className={cx('rating-wrapper')}>
            <span className={cx('rating-text')} onClick={onClickRatings} style={{ cursor: 'pointer' }}>
                {reviewCount} đánh giá | ⭐ {averageRating?.toFixed(1)} / 5
            </span>
        </div>
    );
}

export default ProductRating;
