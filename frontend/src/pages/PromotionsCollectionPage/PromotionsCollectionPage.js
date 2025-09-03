import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import axiosClient from '~/utils/axiosClient';
import styles from '../CollectionsPage/CollectionsPage.module.scss';
import classNames from 'classnames/bind';
import Container from '~/pages/CollectionsPage/Container/Container';
import FilterSidebar from '~/pages/CollectionsPage/FilterSidebar/FilterSidebar';
import ShowByBar from '~/pages/CollectionsPage/ShowByBar/ShowByBar';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

export default function PromotionsCollectionPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({ brands: [], rams: [], cpus: [] });
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [viewMode, setViewMode] = useState('grid4');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // 👉 Format tiền
    function formatCurrency(number) {
        return number.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
    }

    // 👉 Extract filters từ products
    const extractFilters = (products) => {
        const brands = [
            ...new Map(
                products.filter((p) => p.brand).map((p) => [p.brand.slug, { name: p.brand.name, slug: p.brand.slug }]),
            ).values(),
        ];

        const rams = [...new Set(products.map((p) => p.ram))].filter(Boolean);
        const cpus = [...new Set(products.map((p) => p.cpu))].filter(Boolean);

        const prices = products
            .map((p) => Number(p.discountPrice > 0 ? p.discountPrice : p.price))
            .filter((price) => !isNaN(price))
            .sort((a, b) => a - b);

        if (prices.length === 0) return { brands, rams, cpus, priceRanges: [] };

        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        const rangeSize = Math.ceil((maxPrice - minPrice) / 3);

        const priceRanges = [];
        if (rangeSize > 0) {
            priceRanges.push({
                label: `Dưới ${formatCurrency(minPrice + rangeSize)}`,
                value: `0-${minPrice + rangeSize - 1}`,
            });
            priceRanges.push({
                label: `${formatCurrency(minPrice + rangeSize)} – ${formatCurrency(minPrice + rangeSize * 2)}`,
                value: `${minPrice + rangeSize}-${minPrice + rangeSize * 2}`,
            });
            priceRanges.push({
                label: `Trên ${formatCurrency(minPrice + rangeSize * 2)}`,
                value: `${minPrice + rangeSize * 2}-999999999`,
            });
        }

        return { brands, rams, cpus, priceRanges };
    };

    // 👉 Fetch products theo promotion slug
    useEffect(() => {
        setCurrentPage(1);
        const fetchProductsByPromotion = async () => {
            try {
                const res = await axiosClient.get(`/promotions/slug/${slug}/products`);
                setProducts(res.data);
                setFilteredProducts(res.data);
                setFilters(extractFilters(res.data));
            } catch (err) {
                console.error('Lỗi lấy sản phẩm theo promotion:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductsByPromotion();
    }, [slug]);

    // 👉 Filter
    const handleFilterChange = (selectedFilters) => {
        let filtered = [...products];

        if (selectedFilters.price.length > 0) {
            filtered = filtered.filter((p) => {
                const realPrice = Number(p.discountPrice > 0 ? p.discountPrice : p.price);
                return selectedFilters.price.some((range) => {
                    const [min, max] = range.split('-').map(Number);
                    if (max >= 999999999) return realPrice > min;
                    return realPrice >= min && realPrice <= max;
                });
            });
        }

        if (selectedFilters.brand) {
            filtered = filtered.filter((p) => p.brand?.slug === selectedFilters.brand);
        }

        if (selectedFilters.ram) {
            filtered = filtered.filter((p) => p.ram === selectedFilters.ram);
        }

        if (selectedFilters.cpu) {
            filtered = filtered.filter((p) => p.cpu === selectedFilters.cpu);
        }

        setFilteredProducts(filtered);
    };

    return (
        <div className={cx('collections-page-wrapper')}>
            <Breadcrumb type="promotion" categorySlug={slug} />

            <div className={cx('collections-page')}>
                <div className={cx('banner')}>
                    <img src="https://via.placeholder.com/1320x300?text=Promotion+Banner" alt="Promotion Banner" />
                </div>

                <div className={cx('content')}>
                    {/* Sidebar filter */}
                    <aside className={cx('filter')}>
                        <FilterSidebar filters={filters} onChange={handleFilterChange} />
                    </aside>

                    <div className={cx('product-list')}>
                        <ShowByBar
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            totalProducts={filteredProducts.length}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                        />

                        <Container
                            products={filteredProducts}
                            loading={loading}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                        />

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
