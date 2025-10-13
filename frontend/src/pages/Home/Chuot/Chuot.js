// Chuot.js
import React from 'react';
import styles from './Chuot.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function Chuot() {
    const category = CATEGORY_LIST.find((c) => c.name.includes('Chuột')); // hoặc theo key riêng bạn đã đặt

    if (!category) return null; // fallback tránh lỗi nếu không tìm thấy

    return (
        <div className={cx('Chuot-container')}>
            <SectionHeading
                title={category.name}
                shTitle="Giao hàng toàn quốc"
                link={`/categories/${category.slug}`}
            />
            <div className={cx('Chuot-product')}>
                <ProductList category={category.slug} />
            </div>
        </div>
    );
}

export default Chuot;
