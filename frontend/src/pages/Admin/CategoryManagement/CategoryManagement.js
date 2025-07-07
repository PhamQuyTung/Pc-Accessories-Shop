import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CategoryManagement.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', schema: [] });
    const [specField, setSpecField] = useState({ label: '', key: '', type: 'text' });
    const toast = useToast();

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => toast('Lỗi khi tải danh mục', 'error'));
    }, []);

    const handleAddSpecField = () => {
        if (!specField.label || !specField.key) return;
        setNewCategory((prev) => ({
            ...prev,
            schema: [...prev.schema, specField],
        }));
        setSpecField({ label: '', key: '', type: 'text' });
    };

    const handleRemoveSpec = (index) => {
        setNewCategory((prev) => ({
            ...prev,
            schema: prev.schema.filter((_, i) => i !== index),
        }));
    };

    const handleCreateCategory = async () => {
        try {
            await axios.post('http://localhost:5000/api/categories', newCategory);
            toast('Tạo danh mục thành công!', 'success');
            setNewCategory({ name: '', slug: '', description: '', schema: [] });
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
            toast('Lỗi khi tạo danh mục!', 'error');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h2>Quản lý danh mục</h2>

            <div className={cx('form-section')}>
                <input
                    type="text"
                    placeholder="Tên danh mục"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Slug (ví dụ: laptop-gaming)"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                />
                <textarea
                    placeholder="Mô tả"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />

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
                    <button type="button" onClick={handleAddSpecField}>
                        + Thêm thuộc tính
                    </button>
                </div>

                <ul className={cx('spec-list')}>
                    {newCategory.schema.map((spec, index) => (
                        <li key={index}>
                            {spec.label} ({spec.key}) - {spec.type}
                            <button type="button" onClick={() => handleRemoveSpec(index)}>
                                X
                            </button>
                        </li>
                    ))}
                </ul>

                <button type="button" onClick={handleCreateCategory}>
                    Tạo danh mục mới
                </button>
            </div>

            <div className={cx('list-section')}>
                <h3>Danh sách danh mục đã có</h3>
                <ul>
                    {categories.map((cat) => (
                        <li key={cat._id}>
                            <strong>{cat.name}</strong> ({cat.slug}) - {cat.schema?.length || 0} thuộc tính
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CategoryManagement;
