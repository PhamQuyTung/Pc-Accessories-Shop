import React from 'react';
import styles from './ShowByBar.module.scss';
import classNames from 'classnames/bind';
import { FaList } from 'react-icons/fa';
import { Grid3Icons, Grid4Icons, Grid5Icons } from '~/components/Icons';

const cx = classNames.bind(styles);

export default function ShowByBar({ viewMode, setViewMode, totalProducts, currentPage, itemsPerPage }) {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalProducts);

    return (
        <div className={cx('showby-bar')}>
            <div className={cx('btn-wrapper')}>
                <button className={cx({ active: viewMode === 'list' })} onClick={() => setViewMode('list')}>
                    <FaList />
                </button>
                <button className={cx({ active: viewMode === 'grid3' })} onClick={() => setViewMode('grid3')}>
                    <Grid3Icons />
                </button>
                <button className={cx({ active: viewMode === 'grid4' })} onClick={() => setViewMode('grid4')}>
                    <Grid4Icons />
                </button>
                <button className={cx({ active: viewMode === 'grid5' })} onClick={() => setViewMode('grid5')}>
                    <Grid5Icons />
                </button>
            </div>

            <div className={cx('pagination-info')}>
                <span>{`Hiển thị ${startIndex} - ${endIndex} trên tổng ${totalProducts} sản phẩm`}</span>
            </div>
        </div>
    );
}
