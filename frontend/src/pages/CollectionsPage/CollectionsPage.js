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
        const brands = [
            ...new Map(
                products.filter((p) => p.brand).map((p) => [p.brand.slug, { name: p.brand.name, slug: p.brand.slug }]),
            ).values(),
        ];

        const rams = [...new Set(products.map((p) => p.ram))].filter(Boolean);
        const cpus = [...new Set(products.map((p) => p.cpu))].filter(Boolean);

        // Lấy giá thực (ưu tiên discountPrice nếu > 0)
        const prices = products
            .map((p) => Number(p.discountPrice > 0 ? p.discountPrice : p.price))
            .filter((price) => !isNaN(price))
            .sort((a, b) => a - b);

        if (prices.length === 0) {
            return { brands, rams, cpus, priceRanges: [] };
        }

        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        const rangeSize = Math.ceil((maxPrice - minPrice) / 3);

        const priceRanges = [];
        if (rangeSize > 0) {
            // Nhóm 1: Dưới X
            priceRanges.push({
                label: `Dưới ${formatCurrency(minPrice + rangeSize)}`,
                value: `${0}-${minPrice + rangeSize - 1}`,
            });
            // Nhóm 2: X – Y
            priceRanges.push({
                label: `${formatCurrency(minPrice + rangeSize)} – ${formatCurrency(minPrice + rangeSize * 2)}`,
                value: `${minPrice + rangeSize}-${minPrice + rangeSize * 2}`,
            });
            // Nhóm 3: Trên Z
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

    // 👉 Hàm xử lý lọc sản phẩm (đã fix)
    const handleFilterChange = (selectedFilters) => {
        let filtered = [...products];

        // Xử lý nhiều khoảng giá
        if (selectedFilters.price.length > 0) {
            filtered = filtered.filter((p) => {
                const realPrice = Number(p.discountPrice > 0 ? p.discountPrice : p.price);
                return selectedFilters.price.some((range) => {
                    const [min, max] = range.split('-').map(Number);
                    if (max >= 999999999) {
                        return realPrice > min;
                    }
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
