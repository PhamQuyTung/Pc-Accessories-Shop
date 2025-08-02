import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import axiosClient from '~/utils/axiosClient';
import styles from './CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import ProductCard from '~/components/Product/ProductCard';
import BannerLaptop from '~/assets/images/Banner/collections/laptop/laptop-banner.jpg';

const cx = classNames.bind(styles);

export default function CollectionsPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                const res = await axiosClient.get(`/products/category/${slug}`);
                setProducts(res.data);
            } catch (err) {
                console.error('Lỗi lấy sản phẩm theo danh mục:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [slug]);

    return (
        <div className={cx('collections-page')}>
            {/* Banner */}
            <div className={cx('banner')}>
                <img src={BannerLaptop} alt="BannerLaptop" />
            </div>

            {/* Breadcrumb */}
            <Breadcrumb categorySlug={slug} />

            <div className={cx('content')}>
                {/* Bộ lọc */}
                <aside className={cx('filter')}>
                    {/* Bạn có thể tạo component FilterSidebar.js riêng */}
                    <h3>Bộ lọc</h3>
                    {/* Các filter theo giá, hãng, RAM, CPU... */}
                </aside>

                {/* Danh sách sản phẩm */}
                <section className={cx('product-list')}>
                    {loading ? (
                        <p>Đang tải sản phẩm...</p>
                    ) : products.length === 0 ? (
                        <div className={cx('not-found')}>
                            <img src="/images/not-found.png" alt="Không tìm thấy" />
                            <p>Rất tiếc, không tìm thấy sản phẩm nào trong danh mục này.</p>
                        </div>
                    ) : (
                        <div className={cx('grid')}>
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
