// Container.js
import React from 'react';
import styles from '../CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import ProductCard from '~/components/Product/ProductCard';

const cx = classNames.bind(styles);

function Container({ products, loading, viewMode, currentPage, itemsPerPage }) {
    const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) {
        return <p>Đang tải sản phẩm...</p>;
    }

    if (paginatedProducts.length === 0) {
        return (
            <div className={cx('not-found')}>
                <img src="/images/not-found.png" alt="Không tìm thấy" />
                <p>Rất tiếc, không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
            </div>
        );
    }

    return (
        <section className={cx('product-list')}>
            <div className={cx('grid', viewMode)}>
                {paginatedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
            </div>
        </section>
    );
}

export default Container;
