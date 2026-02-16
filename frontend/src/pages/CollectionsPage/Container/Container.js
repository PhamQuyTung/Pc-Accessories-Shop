// Container.js
import React from 'react';
import styles from '../CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import { motion } from "framer-motion";
import ProductCard from '~/components/Product/ProductCard/ProductCard';

const cx = classNames.bind(styles);

function Container({ products, loading, viewMode, currentPage, itemsPerPage }) {
    const safeProducts = Array.isArray(products) ? products : []; // Đảm bảo products luôn là mảng
    const paginatedProducts = safeProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // Phân trang

    if (loading) {
        return (
            <section>
                <div className={cx('grid', viewMode)}>
                    {Array.from({ length: itemsPerPage }).map((_, index) => (
                        <div key={index} className={cx('skeleton-card')}>
                            <div className={cx('skeleton-image')} />
                            <div className={cx('skeleton-line')} />
                            <div className={cx('skeleton-line', 'short')} />
                        </div>
                    ))}
                </div>
            </section>
        );
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
                    <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default Container;
