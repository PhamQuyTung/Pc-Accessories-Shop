import React, { useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [visible, setVisible] = useState('');

    const [sort, setSort] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20; // Số sản phẩm mỗi trang

    const toast = useToast();

    // Hàm lấy sản phẩm từ API
    const fetchProducts = async (page = currentPage) => {
        try {
            const query = new URLSearchParams();
            query.append('isAdmin', true);
            query.append('page', page);
            query.append('limit', limit);

            if (search.trim()) query.append('search', search);
            if (category) query.append('category', category);
            if (visible !== '') query.append('visible', visible);
            if (sort) query.append('sort', sort);

            const res = await axios.get(`http://localhost:5000/api/products?${query.toString()}`);
            console.log(query.toString());

            setProducts(res.data.products);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.currentPage);
        } catch (err) {
            console.error('Lỗi khi tải sản phẩm:', err);
        }
    };

    // Khi người dùng thay đổi bộ lọc, tự động load lại
    useEffect(() => {
        fetchProducts(currentPage);
    }, [search, category, visible, sort, currentPage]);

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
        setCurrentPage(1);

        // toast('Đã xóa tất cả bộ lọc và bật lại ô tìm kiếm', 'success');
    };

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    return (
        <div className={cx('product-management')}>
            <div className={cx('header')}>
                <h2>
                    Quản lý sản phẩm <span className={cx('product-count')}>({products.length})</span>
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
                        disabled={!!category} // ✅ Disable khi có category
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
                        className={cx('select')}
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Hiển thị</option>
                        <option value="false">Đang ẩn</option>
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
                        <th>Giá</th>
                        <th>Giá khuyến mãi</th>
                        <th>Giá thực tế</th>
                        <th>Danh mục</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product._id}>
                            <td>{index + 1}</td>

                            <td>
                                <img
                                    src={product.images?.[0] || '/placeholder.jpg'}
                                    alt={product.name}
                                    className={cx('product-thumb')}
                                />
                            </td>

                            <td>{product.name}</td>

                            <td>{product.price != null ? formatCurrency(product.price) : 'N/A'}</td>
                            <td>{product.discountPrice != null ? formatCurrency(product.discountPrice) : 'N/A'}</td>
                            <td>{formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}</td>

                            <td>{product.category?.name || 'Không có danh mục'}</td>

                            <td>{product.status?.includes('đang nhập hàng') ? 'Đang nhập hàng' : product.quantity}</td>

                            <td>
                                <button
                                    className={cx('toggle-btn', product.visible ? 'active' : 'inactive')}
                                    onClick={() => handleToggleVisible(product._id)}
                                >
                                    {product.visible ? '👁️ Hiển thị' : '🙈 Đang ẩn'}
                                </button>
                            </td>

                            <td>{formatDate(product.createdAt)}</td>

                            <td>
                                <div className={cx('action-buttons')}>
                                    <Link to={`/products/edit/${product._id}`} className={cx('btn-edit-link')}>
                                        <button className={cx('btn-edit')}>✏️</button>
                                    </Link>
                                    <button className={cx('btn-delete')} onClick={() => handleSoftDelete(product._id)}>
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
};

export default ProductManagement;
