import React from 'react';
// import { Link } from 'react-router-dom';
// import { CarIcon } from '~/components/Icons';
import styles from './PC.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';

const cx = classNames.bind(styles);

function PC() {
    return (
        <div className={cx('PC-container')}>
            <SectionHeading title="Build PC" shTitle="Trả góp 0%" link='/pc-gvn' />
            <div className={cx('PC-product')}>
                <ProductList/>
            </div>
        </div>
    );
}

export default PC;
