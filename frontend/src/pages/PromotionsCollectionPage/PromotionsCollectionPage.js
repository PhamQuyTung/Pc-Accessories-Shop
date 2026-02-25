import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import axiosClient from '~/utils/axiosClient';
import styles from '../CollectionsPage/CollectionsPage.module.scss';
import classNames from 'classnames/bind';

import Container from '~/pages/CollectionsPage/Container/Container';
import FilterSidebar from '~/pages/CollectionsPage/FilterSidebar/FilterSidebar';
import ShowByBar from '~/pages/CollectionsPage/ShowByBar/ShowByBar';
import Pagination from '~/components/Pagination/Pagination';

import useCollectionFilters from '~/hooks/useCollectionFilters';

const cx = classNames.bind(styles);

export default function PromotionsCollectionPage() {
    const { slug } = useParams();

    const [viewMode, setViewMode] = useState('grid5');
    const [promotion, setPromotion] = useState(null);

    const {
        products,
        filterOptions,
        draftFilters,
        setDraftFilters,
        handleApply,
        handleReset,
        loading,
        currentPage,
        setCurrentPage,
        totalPages,
    } = useCollectionFilters({
        mode: 'promotion',
        slug,
        itemsPerPage: 100,
        delay: 5000,
    });

    /* ================= FETCH PROMOTION INFO (banner) ================= */
    useEffect(() => {
        const fetchPromotionInfo = async () => {
            try {
                const res = await axiosClient.get(`/promotions/slug/${slug}`);
                setPromotion(res.data);
            } catch (err) {
                console.error('Lỗi lấy promotion info:', err);
            }
        };

        fetchPromotionInfo();
    }, [slug]);

    return (
        <div className={cx('collections-page-wrapper')}>
            {/* Breadcrumb */}
            <Breadcrumb type="promotion" categorySlug={slug} />

            <div className={cx('collections-page')}>
                {/* Banner */}
                {loading ? (
                    <div className={cx('banner-skeleton')} />
                ) : (
                    <img className={cx('fade-in')} src={promotion?.bigBannerImg} alt="Promotion Banner" />
                )}

                <div className={cx('content')}>
                    {/* Sidebar */}
                    <aside className={cx('filter')}>
                        <FilterSidebar
                            filters={filterOptions}
                            draftFilters={draftFilters}
                            setDraftFilters={setDraftFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </aside>

                    {/* Product List */}
                    <div className={cx('product-list')}>
                        <ShowByBar
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            totalProducts={products.length}
                            currentPage={currentPage}
                            itemsPerPage={100}
                        />

                        <Container
                            products={products}
                            loading={loading}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            itemsPerPage={100}
                        />

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
