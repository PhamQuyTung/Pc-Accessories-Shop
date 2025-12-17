import React from 'react';
import styles from './phone.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function Phone() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'dien-thoai');

    if (!category) return null; // fallback nếu không tìm thấy danh mục

    return (
        <div className={cx('phone-container')}>
            <SectionHeading
                title={category.name}
                shTitle="Trả góp 0%"
                link={`/categories/${category.slug}`}
            />
            <div className={cx('phone-product')}>
                <ProductList category={category.slug} />
            </div>
        </div>
    );
}

export default Phone;
