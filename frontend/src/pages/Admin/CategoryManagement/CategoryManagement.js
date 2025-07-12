import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CategoryManagement.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash.debounce';
import Pagination from '~/components/Pagination/Pagination';

const cx = classNames.bind(styles);

function CategoryManagement() {
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingFiltering, setLoadingFiltering] = useState(false);

    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', schema: [] });
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [slugFilter, setSlugFilter] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedSlugFilter, setDebouncedSlugFilter] = useState('');

    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const toast = useToast();

    // Fetch categories
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            toast('Lỗi khi tải danh mục', 'error');
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Debounce both search inputs
    useEffect(() => {
        const debounceHandler = debounce(() => {
            setDebouncedSearchQuery(searchQuery);
            setDebouncedSlugFilter(slugFilter);
        }, 400);

        debounceHandler();
        return () => debounceHandler.cancel();
    }, [searchQuery, slugFilter]);

    // Filter logic
    const getFilteredCategories = (data, name, slug, sortOrder) => {
        return data
            .filter((cat) => cat.name.toLowerCase().includes(name.toLowerCase()))
            .filter((cat) => cat.slug.toLowerCase().includes(slug.toLowerCase()))
            .sort((a, b) => (sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    };

    useEffect(() => {
        const filterData = async () => {
            setLoadingFiltering(true);
            await new Promise((r) => setTimeout(r, 500));

            const filtered = getFilteredCategories(categories, debouncedSearchQuery, debouncedSlugFilter, sortOrder);
            setFilteredCategories(filtered);
            setCurrentPage(1);
            setLoadingFiltering(false);
        };

        filterData();
    }, [categories, debouncedSearchQuery, debouncedSlugFilter, sortOrder]);

    // Create
    const handleCreateCategory = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/categories', newCategory);
            toast('Tạo danh mục thành công!', 'success');
            setNewCategory({ name: '', slug: '', description: '', schema: [] });
            await fetchCategories();
        } catch (err) {
            toast('Lỗi khi tạo danh mục!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Update
    const handleUpdateCategory = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, editingCategory);
            toast('Cập nhật danh mục thành công!', 'success');
            setEditingCategory(null);
            await fetchCategories();
        } catch (err) {
            toast('Cập nhật thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete
    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn chắc chắn?',
            text: 'Hành động này sẽ xóa danh mục vĩnh viễn!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/categories/${id}`);
            toast('Xóa danh mục thành công!', 'success');
            await fetchCategories();
        } catch (err) {
            toast('Xóa thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const generatePagination = () => {
        const pages = [];
        const totalShown = 5; // Số trang muốn hiển thị (ngoài các dấu ...)

        if (totalPages <= totalShown) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('section')}>
                <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h2>
                <div className={cx('form-section')}>
                    <input
                        type="text"
                        placeholder="Tên danh mục"
                        value={editingCategory ? editingCategory.name : newCategory.name}
                        onChange={(e) =>
                            editingCategory
                                ? setEditingCategory({ ...editingCategory, name: e.target.value })
                                : setNewCategory({ ...newCategory, name: e.target.value })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Slug"
                        value={editingCategory ? editingCategory.slug : newCategory.slug}
                        onChange={(e) =>
                            editingCategory
                                ? setEditingCategory({ ...editingCategory, slug: e.target.value })
                                : setNewCategory({ ...newCategory, slug: e.target.value })
                        }
                    />

                    <textarea
                        placeholder="Mô tả"
                        value={editingCategory ? editingCategory.description : newCategory.description}
                        onChange={(e) =>
                            editingCategory
                                ? setEditingCategory({ ...editingCategory, description: e.target.value })
                                : setNewCategory({ ...newCategory, description: e.target.value })
                        }
                    />

                    <select
                        value={editingCategory ? editingCategory.parent || '' : newCategory.parent || ''}
                        onChange={(e) => {
                            const parentId = e.target.value === '' ? null : e.target.value;
                            if (editingCategory) {
                                setEditingCategory({ ...editingCategory, parent: parentId });
                            } else {
                                setNewCategory({ ...newCategory, parent: parentId });
                            }
                        }}
                    >
                        <option value="">-- Không có (cấp 1) --</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div className={cx('btn-group')}>
                        {editingCategory ? (
                            <>
                                <button onClick={handleUpdateCategory} disabled={loading}>
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Cập nhật danh mục'}
                                </button>
                                <button onClick={() => setEditingCategory(null)}>Hủy</button>
                            </>
                        ) : (
                            <button onClick={handleCreateCategory} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Tạo danh mục mới'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={cx('search-section')}>
                <input
                    type="text"
                    placeholder="Tìm danh mục theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Lọc theo slug..."
                    value={slugFilter}
                    onChange={(e) => setSlugFilter(e.target.value)}
                    style={{ marginTop: 10 }}
                />
            </div>

            <div className={cx('section')}>
                <h2>
                    Danh sách danh mục{' '}
                    {filteredCategories.length > 0 && (
                        <span className={cx('count')}>({filteredCategories.length} danh mục)</span>
                    )}
                </h2>
                <table className={cx('category-table')}>
                    <thead>
                        <tr>
                            <th
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                style={{ cursor: 'pointer' }}
                            >
                                Tên {sortOrder === 'asc' ? '↑' : '↓'}
                            </th>
                            <th>Slug</th>
                            <th>Mô tả</th>
                            <th>Số sản phẩm</th>
                            <th>Danh mục cha</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingCategories || loadingFiltering ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Đang tải danh mục...
                                </td>
                            </tr>
                        ) : paginatedCategories.length > 0 ? (
                            paginatedCategories.map((cat) => (
                                <tr key={cat._id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.slug}</td>
                                    <td>{cat.description || 'Không có'}</td>
                                    <td>{cat.productCount || 0}</td>
                                    <td>
                                        {cat.parent
                                            ? categories.find((p) => p._id === cat.parent)?.name || 'Không rõ'
                                            : 'Không có'}
                                    </td>
                                    <td>
                                        <button onClick={() => setEditingCategory(cat)} disabled={loading}>
                                            <FontAwesomeIcon icon={faPen} /> Sửa
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat._id)} disabled={loading}>
                                            <FontAwesomeIcon icon={faTrash} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>
                                    Không có danh mục nào tên là <strong>{debouncedSearchQuery}</strong> và slug là{' '}
                                    <strong>{debouncedSlugFilter}</strong>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
}

export default CategoryManagement;
