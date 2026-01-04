import React, { useState } from 'react';
import styles from './LTG.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function LTG() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'laptop-gaming');
    const [hasProduct, setHasProduct] = useState(true);

    if (!category) return null; // fallback nếu không có danh mục

    return (
        <>
            {hasProduct && (
                <div className={cx('LTG-container')}>
                    <SectionHeading
                        title={category.name}
                        shTitle="Giao hàng toàn quốc"
                        link={`/categories/${category.slug}`}
                    />
                    <div className={cx('LTG-product')}>
                        <ProductList category={category.slug} onHasProductChange={setHasProduct} />
                    </div>
                </div>
            )}
        </>
    );
}

export default LTG;
