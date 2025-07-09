import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CategoryManagement.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', schema: [] });
    const [specField, setSpecField] = useState({ label: '', key: '', type: 'text' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => toast('Lỗi khi tải danh mục', 'error'));
    }, []);

    // const handleAddSpecField = () => {
    //     if (!specField.label || !specField.key) return;
    //     setNewCategory((prev) => ({
    //         ...prev,
    //         schema: [...prev.schema, specField],
    //     }));
    //     setSpecField({ label: '', key: '', type: 'text' });
    // };

    // const handleRemoveSpec = (index) => {
    //     setNewCategory((prev) => ({
    //         ...prev,
    //         schema: prev.schema.filter((_, i) => i !== index),
    //     }));
    // };

    // Tạo danh mục mới
    const handleCreateCategory = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/categories', newCategory);
            toast('Tạo danh mục thành công!', 'success');
            setNewCategory({ name: '', slug: '', description: '', schema: [] });
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            toast('Lỗi khi tạo danh mục!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật danh mục
    const handleUpdateCategory = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, editingCategory);
            toast('Cập nhật danh mục thành công!', 'success');
            setEditingCategory(null);
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            toast('Cập nhật thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Xóa danh mục
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
            setCategories((prev) => prev.filter((cat) => cat._id !== id));
        } catch (err) {
            toast('Xóa thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {/* PHẦN 1 - Tạo mới danh mục */}
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
                        placeholder="Slug (ví dụ: laptop-gaming)"
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

                    {/* Chỉ cho tạo mới thêm thông số kỹ thuật */}
                    {!editingCategory && (
                        <>
                            <div className={cx('spec-field')}>
                                <input
                                    type="text"
                                    placeholder="Tên hiển thị (VD: CPU)"
                                    value={specField.label}
                                    onChange={(e) => setSpecField({ ...specField, label: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Tên khóa (VD: cpu)"
                                    value={specField.key}
                                    onChange={(e) => setSpecField({ ...specField, key: e.target.value })}
                                />
                                <select
                                    value={specField.type}
                                    onChange={(e) => setSpecField({ ...specField, type: e.target.value })}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Select</option>
                                </select>
                                {/* <button type="button" onClick={handleAddSpecField}>
                                    Thêm
                                </button> */}
                            </div>

                            {/* <ul className={cx('spec-list')}>
                                {newCategory.schema.map((spec, index) => (
                                    <li key={index}>
                                        {spec.label} ({spec.key}) - {spec.type}
                                        <button type="button" onClick={() => handleRemoveSpec(index)}>
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul> */}
                        </>
                    )}

                    <div className={cx('btn-group')}>
                        {editingCategory ? (
                            <>
                                <button type="button" onClick={handleUpdateCategory} disabled={loading}>
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Cập nhật danh mục'}
                                </button>
                                <button type="button" onClick={() => setEditingCategory(null)}>
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={handleCreateCategory} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Tạo danh mục mới'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PHẦN 2 - Danh sách danh mục */}
            <div className={cx('section')}>
                <h2>Danh sách danh mục</h2>
                <table className={cx('category-table')}>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Slug</th>
                            <th>Mô tả</th>
                            <th>Số sản phẩm</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id}>
                                <td>{cat.name}</td>
                                <td>{cat.slug}</td>
                                <td>{cat.description || 'Không có'}</td>
                                <td>{cat.productCount || 0}</td>
                                <td>
                                    <button onClick={() => setEditingCategory(cat)} disabled={loading}>
                                        <FontAwesomeIcon icon={faPen} /> Sửa
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat._id)} disabled={loading}>
                                        <FontAwesomeIcon icon={faTrash} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CategoryManagement;
