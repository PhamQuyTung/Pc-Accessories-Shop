// Screen.js
import React from 'react';
import styles from './Screen.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function Screen() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'man-hinh'); // Screen category slug is 'laptop'

    if (!category) return null; // fallback tránh lỗi nếu không tìm thấy

    return (
        <div className={cx('Screen-container')}>
            <SectionHeading
                title={category.name}
                shTitle="Bảo hành 1 đổi 1"
                link={`/categories/${category.slug}`}
            />
            <div className={cx('Screen-product')}>
                <ProductList category={category.slug} />
            </div>
        </div>
    );
}

export default Screen;
