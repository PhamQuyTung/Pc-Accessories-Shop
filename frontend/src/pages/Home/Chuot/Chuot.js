import React from 'react';
// import { Link } from 'react-router-dom';
// import { CarIcon } from '~/components/Icons';
import styles from './Chuot.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';

const cx = classNames.bind(styles);

function Chuot() {
    return (
        <div className={cx('Chuot-container')}>
            <SectionHeading title="Chuột + Lót chuột máy tính" shTitle="Giao hàng toàn quốc" link='/chuot-lot-chuot' />
            <div className={cx('Chuot-product')}>
                <ProductList category="chuot-lot-chuot" />
            </div>
        </div>
    );
}

export default Chuot;
