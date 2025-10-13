import React from 'react';
import styles from './PC.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function PC() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'pc-gvn');

    if (!category) return null; // fallback nếu không tìm thấy danh mục

    return (
        <div className={cx('PC-container')}>
            <SectionHeading
                title={category.name}
                shTitle="Trả góp 0%"
                link={`/categories/${category.slug}`}
            />
            <div className={cx('PC-product')}>
                <ProductList category={category.slug} />
            </div>
        </div>
    );
}

export default PC;
