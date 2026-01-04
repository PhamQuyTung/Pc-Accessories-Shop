// BanPhim.js
import React, { useState } from 'react';
import styles from './BanPhim.module.scss';
import classNames from 'classnames/bind';
import SectionHeading from '~/components/SectionHeading/SectionHeading';
import ProductList from '~/components/Product/Product';
import { CATEGORY_LIST } from '~/constants/categories';

const cx = classNames.bind(styles);

function BanPhim() {
    const category = CATEGORY_LIST.find((c) => c.slug === 'ban-phim');
    const [hasProduct, setHasProduct] = useState(true);

    if (!category) return null; // fallback tránh lỗi nếu không tìm thấy

    return (
        <>
            {hasProduct && (
                <div className={cx('BanPhim-container')}>
                    <SectionHeading
                        title={category.name}
                        shTitle="Giao hàng toàn quốc"
                        link={`/categories/${category.slug}`}
                    />
                    <div className={cx('BanPhim-product')}>
                        <ProductList category={category.slug} onHasProductChange={setHasProduct} />
                    </div>
                </div>
            )}
        </>
    );
}

export default BanPhim;
