import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BrandsPage.module.scss';

import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager'; // ✅ import hook toast
import Swal from 'sweetalert2'; // ✅ sweetalert2

const cx = classNames.bind(styles);

export default function BrandsPage() {
    const [brands, setBrands] = useState([]);
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

    const showToast = useToast();

    // Fetch brands
    useEffect(() => {
        fetchBrands();
    }, []);

    // Lấy danh sách brand từ API
    const fetchBrands = async () => {
        const res = await axiosClient.get('/brands');
        setBrands(res.data);
    };

    // Thêm brand mới
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newBrand.name.trim()) return showToast('Tên thương hiệu không được để trống!', 'warning');
        try {
            await axiosClient.post('/brands', newBrand);
            setNewBrand({ name: '', logo: '', description: '', isVisible: true });
            fetchBrands();
            showToast('Thêm thương hiệu thành công!', 'success');
        } catch (err) {
            showToast('Thêm thương hiệu thất bại!', 'error');
        }
    };

    // Xoá brand với xác nhận
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
            await axiosClient.delete(`/brands/${id}`);
            fetchBrands();
            Swal.fire('Đã xoá!', 'Thương hiệu đã được xoá thành công.', 'success');
        } catch (err) {
            Swal.fire('Lỗi!', 'Xoá thương hiệu thất bại.', 'error');
        }
    };

    // Cập nhật brand
    const handleUpdate = async (id) => {
        try {
            await axiosClient.put(`/brands/${id}`, editingData);
            setEditingId(null);
            fetchBrands();
            showToast('Cập nhật thương hiệu thành công!', 'success');
        } catch (err) {
            showToast('Cập nhật thất bại!', 'error');
        }
    };

    // Bắt đầu sửa brand
    const handleEditClick = (brand) => {
        setEditingId(brand._id);
        setEditingData({
            name: brand.name,
            logo: brand.logo || '',
            description: brand.description || '',
            isVisible: brand.isVisible ?? true,
        });
    };

    // Upload file logo cho brand mới
    const handleNewLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // API upload có thể là /upload, tuỳ backend bạn
        const res = await axiosClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // giả sử API trả về { url: 'http://...' }
        setNewBrand({ ...newBrand, logo: res.data.url });
    };

    // Upload file logo khi edit
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

            {/* Form thêm brand */}
            <form onSubmit={handleAdd} className={cx('add-form')}>
                <input
                    type="text"
                    placeholder="Tên thương hiệu..."
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                />

                {/* Upload logo */}
                <input type="file" accept="image/*" onChange={handleNewLogoChange} />
                {newBrand.logo && <img className={cx('fix-img')} src={newBrand.logo} alt="preview" width="50" />}

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

            {/* Danh sách brand */}
            <table className={cx('brands-table')}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên</th>
                        <th>Slug</th>
                        <th>Logo</th>
                        <th>Mô tả</th>
                        <th>Hiển thị</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map((b, i) => (
                        <tr key={b._id}>
                            <td>{i + 1}</td>
                            <td>
                                {editingId === b._id ? (
                                    <input
                                        value={editingData.name}
                                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                    />
                                ) : (
                                    b.name
                                )}
                            </td>
                            <td>{b.slug}</td>
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
                                    b.logo && <img className={cx('fix-img')} src={b.logo} alt={b.name} width="40" />
                                )}
                            </td>
                            <td>
                                {editingId === b._id ? (
                                    <input
                                        value={editingData.description}
                                        onChange={(e) =>
                                            setEditingData({
                                                ...editingData,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                ) : (
                                    b.description
                                )}
                            </td>
                            <td>
                                {editingId === b._id ? (
                                    <input
                                        type="checkbox"
                                        checked={editingData.isVisible}
                                        onChange={(e) =>
                                            setEditingData({
                                                ...editingData,
                                                isVisible: e.target.checked,
                                            })
                                        }
                                    />
                                ) : b.isVisible ? (
                                    '✅'
                                ) : (
                                    '❌'
                                )}
                            </td>
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
        </div>
    );
}
