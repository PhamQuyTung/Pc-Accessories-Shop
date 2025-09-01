import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BrandsPage.module.scss';
import Swal from 'sweetalert2';

import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import Pagination from '~/components/Pagination/Pagination';
import SkeletonTable from '~/components/Skeleton/SkeletonTable/SkeletonTable';
import SkeletonForm from '~/components/Skeleton/SkeletonForm/SkeletonForm';
import { withMinimumDelay } from '~/utils/withMinimumDelay';

const cx = classNames.bind(styles);

export default function BrandsPage() {
    const [brands, setBrands] = useState([]);

    // Tổng sô thương hiệu
    const [totalBrands, setTotalBrands] = useState(0);

    const [newBrand, setNewBrand] = useState({
        name: '',
        logo: '',
        description: '',
        isVisible: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({
        name: '',
        logo: '',
        description: '',
        isVisible: true,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(false);

    const showToast = useToast();

    // Debounce searchTerm
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch brands mỗi khi page hoặc debouncedSearchTerm thay đổi
    useEffect(() => {
        fetchBrands();
    }, [currentPage, debouncedSearchTerm]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(
                `/brands/paginated?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchTerm}`,
            );

            // Ép skeleton hiển thị ít nhất 400ms
            await new Promise((resolve) => setTimeout(resolve, 400));

            setBrands(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
            setTotalBrands(res.data.pagination.total); // 👈 lưu tổng brands
        } catch (err) {
            showToast('Không tải được danh sách thương hiệu!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newBrand.name.trim()) return showToast('Tên thương hiệu không được để trống!', 'warning');
        try {
            setLoading(true);
            await withMinimumDelay(axiosClient.post('/brands', newBrand), 400);
            setNewBrand({ name: '', logo: '', description: '', isVisible: true });
            fetchBrands();
            showToast('Thêm thương hiệu thành công!', 'success');
        } catch (err) {
            showToast('Thêm thương hiệu thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Xoá thương hiệu?',
            text: 'Bạn có chắc chắn muốn xoá thương hiệu này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Hủy',
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoading(true);
            await withMinimumDelay(axiosClient.delete(`/brands/${id}`), 400);
            fetchBrands();
            Swal.fire('Đã xoá!', 'Thương hiệu đã được xoá thành công.', 'success');
        } catch (err) {
            Swal.fire('Lỗi!', 'Xoá thương hiệu thất bại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            setLoading(true);
            await withMinimumDelay(axiosClient.put(`/brands/${id}`, editingData), 400);
            setEditingId(null);
            fetchBrands();
            showToast('Cập nhật thương hiệu thành công!', 'success');
        } catch (err) {
            showToast('Cập nhật thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (brand) => {
        setEditingId(brand._id);
        setEditingData({
            name: brand.name,
            logo: brand.logo || '',
            description: brand.description || '',
            isVisible: brand.isVisible ?? true,
        });
    };

    const handleNewLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setNewBrand({ ...newBrand, logo: res.data.url });
    };

    const handleEditLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEditingData({ ...editingData, logo: res.data.url });
    };

    return (
        <div className={cx('brands-page')}>
            <h2>Quản lý thương hiệu</h2>

            {loading ? (
                <>
                    {/* Skeleton Search */}
                    <div className={cx('skeleton-search')}>
                        <div className={cx('skeleton-input')} />
                    </div>

                    {/* Skeleton Form */}
                    <SkeletonForm rows={4} className={cx('shimmer')} />

                    {/* Skeleton Table */}
                    <table className={cx('brands-table')}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên</th>
                                <th>Slug</th>
                                <th>Logo</th>
                                <th>Mô tả</th>
                                <th>Sản phẩm</th>
                                <th>Hiển thị</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <SkeletonTable
                            columns={8}
                            rows={pageSize}
                            hasImageColumn={true}
                            imageColumnIndex={3}
                            className={cx('shimmer')}
                        />
                    </table>

                    {/* Pagination Skeleton */}
                    <div className={cx('pagination-skeleton')}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={cx('page-skeleton')} />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Search thật */}
                    <div className={cx('search-box')}>
                        <label>Tìm kiếm: </label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thương hiệu..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Form thật */}
                    <form onSubmit={handleAdd} className={cx('add-form')}>
                        <label>Thêm thương hiệu mới:</label>
                        <input
                            type="text"
                            placeholder="Tên thương hiệu..."
                            value={newBrand.name}
                            onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                        />
                        <input type="file" accept="image/*" onChange={handleNewLogoChange} />
                        {newBrand.logo && (
                            <img className={cx('fix-img')} src={newBrand.logo} alt="preview" width="50" />
                        )}
                        <input
                            type="text"
                            placeholder="Mô tả..."
                            value={newBrand.description}
                            onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={newBrand.isVisible}
                                onChange={(e) => setNewBrand({ ...newBrand, isVisible: e.target.checked })}
                            />
                            Hiển thị
                        </label>
                        <button type="submit">Thêm</button>
                    </form>

                    {/* Tổng số thương hiệu */}
                    <div className={cx('total-brands')}>
                        Tổng số thương hiệu: <b>{totalBrands}</b>
                    </div>

                    {/* Table thật */}
                    <table className={cx('brands-table')}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên</th>
                                <th>Slug</th>
                                <th>Logo</th>
                                <th>Mô tả</th>
                                <th>Sản phẩm</th>
                                <th>Hiển thị</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((b, i) => (
                                <tr key={b._id}>
                                    {/* STT */}
                                    <td>{(currentPage - 1) * pageSize + (i + 1)}</td>

                                    {/* Tên thương hiệu */}
                                    <td>
                                        {editingId === b._id ? (
                                            <input
                                                value={editingData.name}
                                                onChange={(e) =>
                                                    setEditingData({ ...editingData, name: e.target.value })
                                                }
                                            />
                                        ) : (
                                            b.name
                                        )}
                                    </td>

                                    {/* slug thương hiệu */}
                                    <td>{b.slug}</td>

                                    {/* logo của thương hiệu */}
                                    <td>
                                        {editingId === b._id ? (
                                            <>
                                                <input type="file" accept="image/*" onChange={handleEditLogoChange} />
                                                {editingData.logo && (
                                                    <img
                                                        className={cx('fix-img')}
                                                        src={editingData.logo}
                                                        alt="preview"
                                                        width="40"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            b.logo && (
                                                <img className={cx('fix-img')} src={b.logo} alt={b.name} width="40" />
                                            )
                                        )}
                                    </td>

                                    {/* mô tả của thương hiệu */}
                                    <td>
                                        {editingId === b._id ? (
                                            <input
                                                value={editingData.description}
                                                onChange={(e) =>
                                                    setEditingData({ ...editingData, description: e.target.value })
                                                }
                                            />
                                        ) : (
                                            b.description
                                        )}
                                    </td>

                                    {/* 👈 hiển thị số sản phẩm đc áp dụng */}
                                    <td>{b.productCount ?? 0}</td>

                                    {/* Hiển thị / ko hiển thị trạng thái brand */}
                                    <td>
                                        {editingId === b._id ? (
                                            <input
                                                type="checkbox"
                                                checked={editingData.isVisible}
                                                onChange={(e) =>
                                                    setEditingData({ ...editingData, isVisible: e.target.checked })
                                                }
                                            />
                                        ) : b.isVisible ? (
                                            '✅'
                                        ) : (
                                            '❌'
                                        )}
                                    </td>

                                    {/* Hành động Sửa / Xoá */}
                                    <td>
                                        {editingId === b._id ? (
                                            <>
                                                <button onClick={() => handleUpdate(b._id)}>Lưu</button>
                                                <button onClick={() => setEditingId(null)}>Hủy</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(b)}>Sửa</button>
                                                <button onClick={() => handleDelete(b._id)}>Xóa</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination thật */}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}
        </div>
    );
}
