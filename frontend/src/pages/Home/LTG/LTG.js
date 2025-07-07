import React from 'react';
// import { Link } from 'react-router-dom';
// import { CarIcon } from '~/components/Icons';
import styles from './LTG.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';

const cx = classNames.bind(styles);

function LTG() {
    return (
        <div className={cx('LTG-container')}>
            <SectionHeading title="Laptop gaming" shTitle="Miễn phí giao hàng" link='/laptop-gaming' />
            <div className={cx('LTG-product')}>
                <ProductList category="laptop-gaming" />
            </div>
        </div>
    );
}

export default LTG;
