// src/components/LoadingSpinner.jsx
import React from 'react';
import styles from './SpinnerLoading.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function LoadingSpinner() {
    return (
        <div className={cx('spinner-wrapper')}>
            <div className={cx('spinner')}></div>
        </div>
    );
}

export default LoadingSpinner;
