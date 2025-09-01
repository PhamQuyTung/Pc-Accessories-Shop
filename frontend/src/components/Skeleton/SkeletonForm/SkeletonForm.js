import React from 'react';
import classNames from 'classnames/bind';
import styles from './SkeletonForm.module.scss';

const cx = classNames.bind(styles);

export default function SkeletonForm({ rows = 4 }) {
    return (
        <div className={cx('skeleton-form')}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={cx('form-row')}>
                    <div className={cx('skeleton-label')} />
                    <div className={cx('skeleton-input')} />
                </div>
            ))}
            <div className={cx('form-row')}>
                <div className={cx('skeleton-label')} />
                <div className={cx('skeleton-checkbox')} />
            </div>
            <div className={cx('form-row')}>
                <div className={cx('skeleton-button')} />
            </div>
        </div>
    );
}
