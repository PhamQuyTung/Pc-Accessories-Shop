import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt, FaClone } from 'react-icons/fa';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';
import SkeletonTable from '~/components/Skeleton/SkeletonTable/SkeletonTable';

const cx = classNames.bind(styles);

const getDefaultVariant = (product) => {
    if (!product.variations?.length) return null;

    return product.variations.find((v) => v._id === product.defaultVariantId) || product.variations[0];
};

const getDisplayPrices = (product) => {
    // 1️⃣ Variable product
    if (product.variations?.length > 0) {
        const variant = getDefaultVariant(product);
        if (!variant) return {};

        return {
            price: variant.price,
            discountPrice: variant.discountPrice,
            finalPrice: variant.discountPrice > 0 ? variant.discountPrice : variant.price,
        };
    }

    // 2️⃣ Simple product
    return {
        price: product.price,
        discountPrice: product.discountPrice,
        finalPrice: product.discountPrice > 0 ? product.discountPrice : product.price,
    };
};

const ProductManagement = () => {
    const [totalCount, setTotalCount] = useState(0);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [visible, setVisible] = useState('');

    const [sort, setSort] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10; // Số sản phẩm mỗi trang

    const [variantCounts, setVariantCounts] = useState({});

    const [productType, setProductType] = useState('');

    const [loading, setLoading] = useState(false);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const toast = useToast();

    // Hàm lấy sản phẩm từ API
    const fetchProducts = async (page = currentPage) => {
        setLoading(true);

        try {
            const query = new URLSearchParams();
            query.append('isAdmin', true);
            query.append('page', page);
            query.append('limit', limit);

            if (search.trim()) query.append('search', search);
            if (category) query.append('category', category);
            if (visible !== '') query.append('visible', visible);
            if (productType) query.append('productType', productType);
            if (sort) query.append('sort', sort);

            const [res] = await Promise.all([
                axios.get(`http://localhost:5000/api/products?${query.toString()}`),
                sleep(3000), // ⏱️ UX DELAY 3s
            ]);

            setTotalCount(res.data.totalCount);
            setProducts(res.data.products);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.currentPage);
        } catch (err) {
            console.error('Lỗi khi tải sản phẩm:', err);
        } finally {
            setLoading(false);
        }
    };

    // Lấy số lượng biến thể cho mỗi sản phẩm
    useEffect(() => {
        const fetchVariantCounts = async () => {
            const counts = {};

            await Promise.all(
                products.map(async (product) => {
                    try {
                        const res = await axios.get(`http://localhost:5000/api/variants/${product._id}/count`);
                        counts[product._id] = res.data.count || 0;
                    } catch (err) {
                        counts[product._id] = 0;
                    }
                }),
            );

            setVariantCounts(counts);
        };

        if (products.length > 0) {
            fetchVariantCounts();
        }
    }, [products]);

    // Khi người dùng thay đổi bộ lọc, tự động load lại
    useEffect(() => {
        fetchProducts(currentPage);
    }, [search, category, visible, sort, currentPage, productType]);

    // Lấy danh mục
    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Lỗi khi tải danh mục:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        console.log('Dữ liệu products:', products);
    }, [products]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return '0đ'; // hoặc return 'N/A' nếu muốn
        return value.toLocaleString('vi-VN') + 'đ';
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleSoftDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa tạm thời sản phẩm này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/products/soft/${id}`);
                toast('Đã chuyển sản phẩm vào thùng rác!', 'success');
                fetchProducts(currentPage);
            } catch (err) {
                toast('Lỗi khi xóa sản phẩm!', 'error');
            }
        }
    };

    const handleToggleVisible = async (id) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/products/toggle-visible/${id}`);
            toast(res.data.message, 'success');
            fetchProducts(currentPage);
        } catch (err) {
            toast('Lỗi khi cập nhật trạng thái hiển thị', 'error');
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setVisible('');
        setSort('');
        setProductType('');
        setCurrentPage(1);

        // toast('Đã xóa tất cả bộ lọc và bật lại ô tìm kiếm', 'success');
    };

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const getProductThumbnail = (product) => {
        const hasVariations = product.variations?.length > 0;

        if (hasVariations) {
            let variant = null;

            // 1️⃣ Ưu tiên defaultVariantId
            if (product.defaultVariantId) {
                variant = product.variations.find((v) => String(v._id) === String(product.defaultVariantId));
            }

            // 2️⃣ Fallback: lấy variant đầu tiên
            if (!variant) {
                variant = product.variations[0];
            }

            // 3️⃣ Ưu tiên images → thumbnail
            if (variant?.images?.length > 0) {
                return variant.images[0];
            }

            if (variant?.thumbnail) {
                return variant.thumbnail;
            }

            return '/placeholder.jpg';
        }

        // SIMPLE PRODUCT
        if (product.images?.length > 0) {
            return product.images[0];
        }

        return '/placeholder.jpg';
    };

    // const hasVariations = products.variations?.length > 0;
    // const missingDefaultVariant = hasVariations && !products.defaultVariantId;

    return (
        <div className={cx('product-management')}>
            <div className={cx('header')}>
                <h2>
                    Quản lý sản phẩm <span className={cx('product-count')}>({totalCount})</span>
                </h2>
                <Link to="/admin/products/create" className={cx('btn-add')}>
                    + Thêm sản phẩm mới
                </Link>
            </div>

            <div className={cx('filter-container')}>
                <div className={cx('filter-group')}>
                    <label htmlFor="search">🔍 Tìm kiếm:</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className={cx('input')}
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        disabled={!!category || loading} // ✅ Disable khi có category và khi loading
                    />
                    {category && (
                        <div className={cx('disabled-note')}>
                            🔒 Tìm kiếm bị vô hiệu hóa do đang lọc theo danh mục. Hãy <strong>xóa bộ lọc</strong> để sử
                            dụng lại.
                        </div>
                    )}
                </div>

                <div className={cx('filter-group')}>
                    <label htmlFor="category">📂 Danh mục:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setSearch(''); // ✅ Reset search nếu lọc
                            setCurrentPage(1); // ✅ Reset trang
                            // toast('Đã reset ô tìm kiếm do bạn đang lọc danh mục', 'info');
                        }}
                        disabled={loading}
                        className={cx('select')}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label htmlFor="visible">👁️ Trạng thái hiển thị:</label>
                    <select
                        id="visible"
                        value={visible}
                        onChange={(e) => setVisible(e.target.value)}
                        disabled={loading}
                        className={cx('select')}
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Hiển thị</option>
                        <option value="false">Đang ẩn</option>
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label htmlFor="productType">🧩 Loại sản phẩm:</label>
                    <select
                        id="productType"
                        value={productType}
                        onChange={(e) => {
                            setProductType(e.target.value);
                            setCurrentPage(1);
                        }}
                        disabled={loading}
                        className={cx('select')}
                    >
                        <option value="">Tất cả</option>
                        <option value="variable">Có biến thể</option>
                        <option value="simple">Không có biến thể</option>
                    </select>
                </div>

                <div className={cx('filter-group', 'button-group')}>
                    <button type="button" onClick={handleClearFilters} className={cx('clear-button')}>
                        🧹 Xóa bộ lọc và tìm kiếm
                    </button>
                </div>

                <div className={cx('filter-group')}>
                    <label htmlFor="sort">📊 Sắp xếp:</label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setCurrentPage(1); // ✅ Reset về trang đầu mỗi khi sắp xếp
                        }}
                        disabled={loading}
                        className={cx('select')}
                    >
                        <option value="">Mặc định</option>
                        <option value="name_asc">Tên A-Z</option>
                        <option value="name_desc">Tên Z-A</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                        <option value="quantity_asc">Số lượng ít nhất</option>
                        <option value="quantity_desc">Số lượng nhiều nhất</option>
                        <option value="createdAt_asc">Ngày tạo cũ nhất</option>
                        <option value="createdAt_desc">Ngày tạo mới nhất</option>
                    </select>
                </div>
            </div>

            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Thương hiệu</th>
                        <th>Giá</th>
                        <th>Giá khuyến mãi</th>
                        <th>Giá thực tế</th>
                        <th>Danh mục</th>
                        <th>Số lượng</th>
                        <th>Số lượng biến thể</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                {loading ? (
                    <SkeletonTable
                        columns={13} // đúng số <th>
                        rows={limit} // số dòng skeleton = page size
                        hasImageColumn={true}
                        imageColumnIndex={1} // cột hình ảnh (ID=0, Image=1)
                    />
                ) : (
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product._id}>
                                <td>{(currentPage - 1) * limit + index + 1}</td>

                                <td>
                                    <img
                                        src={getProductThumbnail(product)}
                                        alt={product.name}
                                        className={cx('product-thumb')}
                                    />
                                </td>

                                <td>
                                    <Link to={`/products/${product.slug}`} className={cx('product-link')}>
                                        {product.name}
                                    </Link>

                                    {product.variations?.length > 0 && (
                                        <span className={cx('variant-badge')}>Biến thể</span>
                                    )}
                                </td>

                                <td>
                                    {typeof product.brand === 'object' && product.brand?.name
                                        ? product.brand.name
                                        : typeof product.brand === 'string'
                                          ? product.brand
                                          : 'Không có thương hiệu'}
                                </td>

                                {(() => {
                                    const { price, discountPrice, finalPrice } = getDisplayPrices(product);

                                    return (
                                        <>
                                            <td>{price > 0 ? formatCurrency(price) : '—'}</td>
                                            <td>{discountPrice > 0 ? formatCurrency(discountPrice) : '—'}</td>

                                            <td>
                                                {product.variations?.length > 0 ? (
                                                    <Tippy
                                                        content={
                                                            <span className={cx('tooltip-content')}>
                                                                Giá hiển thị theo biến thể mặc định
                                                            </span>
                                                        }
                                                        placement="top"
                                                        animation="scale"
                                                        delay={[100, 0]}
                                                        interactive
                                                        appendTo={document.body}
                                                    >
                                                        <span className={cx('price-tooltip')}>
                                                            {finalPrice > 0 ? formatCurrency(finalPrice) : '—'}
                                                            <span className={cx('price-tooltip-icon')}>ⓘ</span>
                                                        </span>
                                                    </Tippy>
                                                ) : (
                                                    <span>{finalPrice > 0 ? formatCurrency(finalPrice) : '—'}</span>
                                                )}
                                            </td>
                                        </>
                                    );
                                })()}

                                <td>
                                    {typeof product.category === 'object' && product.category?.name
                                        ? product.category.name
                                        : 'Không có danh mục'}
                                </td>

                                <td>
                                    {product.variations?.length > 0 ? (
                                        <Tippy
                                            content={
                                                <span className={cx('tooltip-content')}>
                                                    Số lượng hiển thị theo biến thể mặc định
                                                </span>
                                            }
                                            placement="top"
                                            animation="scale"
                                            delay={[100, 0]}
                                            interactive
                                            appendTo={document.body}
                                        >
                                            <span className={cx('quantity-tooltip')}>
                                                <span>{product.displayQuantity}</span>
                                                <span className={cx('quantity-tooltip-icon')}>ⓘ</span>
                                            </span>
                                        </Tippy>
                                    ) : (
                                        product.displayQuantity
                                    )}
                                </td>

                                <td>{variantCounts[product._id] ?? '...'}</td>

                                <td>
                                    <button
                                        className={cx('toggle-btn', product.visible ? 'active' : 'inactive')}
                                        onClick={() => handleToggleVisible(product._id)}
                                        disabled={loading} // ⭐ tránh spam click
                                    >
                                        {product.visible ? '👁️ Hiển thị' : '🙈 Đang ẩn'}
                                    </button>
                                </td>

                                <td>{formatDate(product.createdAt)}</td>

                                <td>
                                    <div className={cx('action-buttons')}>
                                        <Link to={`/products/edit/${product._id}`} className={cx('btn-edit-link')}>
                                            <button className={cx('btn-edit')}>
                                                <FaPencilAlt size={14} />
                                            </button>
                                        </Link>

                                        <Link
                                            to={`/admin/products/${product._id}/variants`}
                                            className={cx('btn-edit-link')}
                                        >
                                            <button className={cx('btn-variant')}>
                                                <FaClone size={14} />
                                            </button>
                                        </Link>

                                        <button
                                            className={cx('btn-delete')}
                                            onClick={() => handleSoftDelete(product._id)}
                                            disabled={loading}
                                        >
                                            <FaTrashAlt size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={!loading ? handlePageChange : () => {}} />
            )}
        </div>
    );
};

export default ProductManagement;
