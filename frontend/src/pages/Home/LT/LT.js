// LT.js
import React from 'react';
import styles from './LT.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function LT() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'laptop'); // LT category slug is 'laptop'

    if (!category) return null; // fallback tránh lỗi nếu không tìm thấy

    return (
        <div className={cx('LT-container')}>
            <SectionHeading
                title={category.name}
                shTitle="Miễn phí giao hàng"
                link={`/categories/${category.slug}`}
            />
            <div className={cx('LT-product')}>
                <ProductList category={category.slug} />
            </div>
        </div>
    );
}

export default LT;
