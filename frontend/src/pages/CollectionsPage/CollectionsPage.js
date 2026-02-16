import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import axiosClient from '~/utils/axiosClient';
import styles from './CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import BannerLaptop from '~/assets/images/Banner/collections/laptop/laptop-banner.jpg';
import Container from '~/pages/CollectionsPage/Container/Container';
import FilterSidebar from '~/pages/CollectionsPage/FilterSidebar/FilterSidebar';
import ShowByBar from './ShowByBar/ShowByBar';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

const DEFAULT_FILTERS = {
    price: [],
    brand: '',
    ram: '',
    cpu: '',
};

export default function CollectionsPage() {
    const { slug } = useParams();

    const [products, setProducts] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        rams: [],
        cpus: [],
        priceMin: 0,
        priceMax: 0,
    });

    // 🔥 Draft (đang chỉnh)
    const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

    // 🔥 Applied (đã áp dụng → mới fetch)
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid5');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 10; // Số sản phẩm trên mỗi trang

    // ===============================
    // RESET khi đổi category
    // ===============================
    useEffect(() => {
        setCurrentPage(1);
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, [slug]);

    // ===============================
    // FETCH PRODUCTS
    // ===============================
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append('category', slug);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            if (appliedFilters.price.length > 0) {
                params.append('price', appliedFilters.price.join(','));
            }

            if (appliedFilters.brand) params.append('brand', appliedFilters.brand);
            if (appliedFilters.ram) params.append('ram', appliedFilters.ram);
            if (appliedFilters.cpu) params.append('cpu', appliedFilters.cpu);

            const res = await axiosClient.get(`/products?${params.toString()}`);

            // ⬇️ delay 5 giây
            await new Promise((resolve) => setTimeout(resolve, 5000));

            setProducts(res.data.products || []);
            setTotalPages(res.data.totalPages || 1);

            setFilterOptions((prev) => ({
                ...prev,
                brands: res.data.brands || [],
                rams: res.data.rams || [],
                cpus: res.data.cpus || [],
                priceMin: prev.priceMin || res.data.priceMin || 0,
                priceMax: prev.priceMax || res.data.priceMax || 0,
            }));
        } catch (err) {
            console.error('Lỗi fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, currentPage, appliedFilters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // ===============================
    // APPLY FILTER
    // ===============================
    const handleApplyFilters = () => {
        setCurrentPage(1);
        setAppliedFilters(draftFilters);
    };

    // ===============================
    // RESET FILTER
    // ===============================
    const handleResetFilters = () => {
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
    };

    return (
        <div className={cx('collections-page-wrapper')}>
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
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                    </aside>

                    {/* Product List */}
                    <div className={cx('product-list')}>
                        <ShowByBar
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            totalProducts={products.length}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                        />

                        <Container
                            products={products}
                            loading={loading}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
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
