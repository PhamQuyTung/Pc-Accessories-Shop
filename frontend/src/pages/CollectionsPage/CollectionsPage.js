import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import styles from './CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import BannerLaptop from '~/assets/images/Banner/collections/laptop/laptop-banner.jpg';

import Container from '~/pages/CollectionsPage/Container/Container';
import FilterSidebar from '~/pages/CollectionsPage/FilterSidebar/FilterSidebar';
import ShowByBar from './ShowByBar/ShowByBar';
import Pagination from '~/components/Pagination/Pagination';

import useCollectionFilters from '~/hooks/useCollectionFilters';

const cx = classNames.bind(styles);

export default function CollectionsPage() {
    const { slug } = useParams();

    const [viewMode, setViewMode] = useState('grid5');

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
        mode: 'category',
        slug,
        itemsPerPage: 100,
        delay: 5000,
    });

    console.log('COLLECTION PRODUCTS:', products);

    return (
        <div className={cx('collections-page-wrapper')}>
            {/* Breadcrumb */}
            <Breadcrumb type="category" categorySlug={slug} />

            <div className={cx('collections-page')}>
                {/* Banner */}
                <div className={cx('banner')}>
                    <img src={BannerLaptop} alt="BannerLaptop" />
                </div>

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
