// Container.js
import React from 'react';
import styles from '../CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import ProductCard from '~/components/Product/ProductCard/ProductCard';

const cx = classNames.bind(styles);

function Container({ products, loading, viewMode, currentPage, itemsPerPage }) {
    const safeProducts = Array.isArray(products) ? products : [];   // Đảm bảo products luôn là mảng
    const paginatedProducts = safeProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // Phân trang

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
