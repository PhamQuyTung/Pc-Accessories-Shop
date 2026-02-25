import { useState, useEffect, useCallback } from 'react';
import axiosClient from '~/utils/axiosClient';

const DEFAULT_FILTERS = {
    price: '',
    brand: '',
    ram: '',
    cpu: '',
};

export default function useCollectionFilters({
    mode, // "category" | "promotion"
    slug,
    itemsPerPage = 100,
    delay = 5000,
}) {
    const [products, setProducts] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        rams: [],
        cpus: [],
        priceMin: 0,
        priceMax: 0,
    });

    const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Reset khi đổi slug
    useEffect(() => {
        setCurrentPage(1);
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, [slug]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            if (mode === 'category') {
                params.append('category', slug);
            }

            if (mode === 'promotion') {
                params.append('promotion', slug);
            }

            if (appliedFilters.price) {
                params.append('price', appliedFilters.price);
            }

            if (appliedFilters.brand) params.append('brand', appliedFilters.brand);
            if (appliedFilters.ram) params.append('ram', appliedFilters.ram);
            if (appliedFilters.cpu) params.append('cpu', appliedFilters.cpu);

            const endpoint = `/products?${params.toString()}`;

            const res = await axiosClient.get(endpoint);

            await new Promise((resolve) => setTimeout(resolve, delay));

            const data = mode === 'promotion' ? res.data.products || res.data : res.data.products || [];

            console.log("FILTER OPTIONS:", res.data);

            setProducts(data);

            setTotalPages(res.data.totalPages || 1);

            setFilterOptions({
                brands: res.data.brands || [],
                rams: res.data.rams || [],
                cpus: res.data.cpus || [],
                priceMin: res.data.priceMin || 0,
                priceMax: res.data.priceMax || 0,
            });
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, currentPage, appliedFilters, mode, itemsPerPage, delay]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleApply = () => {
        setCurrentPage(1);
        setAppliedFilters(draftFilters);
    };

    const handleReset = () => {
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
    };

    return {
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
    };
}
