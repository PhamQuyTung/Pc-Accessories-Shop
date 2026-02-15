// Screen.js
import React, { useState } from 'react';
import styles from './Screen.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/HomeProduct/HomeProduct';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function Screen() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'man-hinh'); // Screen category slug is 'man-hinh'
    const [hasProduct, setHasProduct] = useState(true);

    if (!category) return null; // fallback tránh lỗi nếu không tìm thấy

    return (
        <>
            {hasProduct && (
                <div className={cx('Screen-container')}>
                    <SectionHeading
                        title={category.name}
                        shTitle="Giao hàng toàn quốc"
                        link={`/categories/${category.slug}`}
                    />
                    <div className={cx('Screen-product')}>
                        <ProductList category={category.slug} onHasProductChange={setHasProduct} />
                    </div>
                </div>
            )}
        </>
    );
}

export default Screen;
