import React, { useEffect, useState } from 'react';
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

export default function CollectionsPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({ brands: [], rams: [], cpus: [] });
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [viewMode, setViewMode] = useState('grid4');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalPages = Math.ceil(products.length / itemsPerPage);

    // 👉 Hàm làm tròn lên theo bước
    const roundUpTo = (value, step) => Math.ceil(value / step) * step;

    // 👉 Format tiền tệ
    function formatCurrency(number) {
        return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    // 👉 Trích xuất bộ lọc từ danh sách sản phẩm
    const extractFilters = (products) => {
        const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean);
        const rams = [...new Set(products.map((p) => p.ram))].filter(Boolean);
        const cpus = [...new Set(products.map((p) => p.cpu))].filter(Boolean);

        const prices = products.map((p) => p.discountPrice || p.price).sort((a, b) => a - b);
        const rawMin = prices[0] || 0;
        const rawMax = prices[prices.length - 1] || 0;

        const minPrice = roundUpTo(rawMin, 100000); // tròn 100.000
        const maxPrice = roundUpTo(rawMax, 100000);
        const rangeSize = Math.ceil((maxPrice - minPrice) / 3);
        const priceRanges = [];

        if (rangeSize > 0) {
            priceRanges.push({
                label: `Dưới ${formatCurrency(minPrice + rangeSize)}`,
                value: `${minPrice}-${minPrice + rangeSize}`,
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

    // 👉 Gọi API khi thay đổi danh mục
    useEffect(() => {
        setCurrentPage(1); // Reset về trang 1
        const fetchProductsByCategory = async () => {
            try {
                const res = await axiosClient.get(`/products/category/${slug}`);
                setProducts(res.data);
                setFilteredProducts(res.data);
                setFilters(extractFilters(res.data));
            } catch (err) {
                console.error('Lỗi lấy sản phẩm theo danh mục:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [slug]);

    // 👉 Hàm xử lý lọc sản phẩm
    const handleFilterChange = (selectedFilters) => {
        let filtered = [...products];

        if (selectedFilters.price) {
            const [min, max] = selectedFilters.price.split('-').map(Number);
            filtered = filtered.filter((p) => {
                const realPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                return realPrice >= min && realPrice <= max;
            });
        }

        if (selectedFilters.brand) {
            filtered = filtered.filter((p) => p.brand === selectedFilters.brand);
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
            {/* Breadcrumb */}
            <Breadcrumb categorySlug={slug} />

            <div className={cx('collections-page')}>
                {/* Banner */}
                <div className={cx('banner')}>
                    <img src={BannerLaptop} alt="BannerLaptop" />
                </div>

                <div className={cx('content')}>
                    {/* Bộ lọc */}
                    <aside className={cx('filter')}>
                        <FilterSidebar filters={filters} onChange={handleFilterChange} />
                    </aside>

                    {/* Danh sách sản phẩm */}
                    <div className={cx('product-list')}>
                        {/* ShowByBar */}
                        <ShowByBar
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            totalProducts={products.length}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                        />

                        {/* Container danh sách sản phẩm */}
                        <Container
                            products={filteredProducts}
                            loading={loading}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                        />

                        {/* Pagination */}
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
