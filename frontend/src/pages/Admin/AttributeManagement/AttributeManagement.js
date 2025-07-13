import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AttributeManagement.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function AttributeManagement() {
    const [attributes, setAttributes] = useState([]);
    const [form, setForm] = useState({ name: '', key: '', type: 'text' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        const res = await axios.get('http://localhost:5000/api/attributes');
        setAttributes(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/attributes/${editingId}`, form);
            } else {
                await axios.post('http://localhost:5000/api/attributes', form);
            }
            setForm({ name: '', key: '', type: 'text' });
            setEditingId(null);
            fetchAttributes();
        } catch (err) {
            alert('Lỗi khi lưu thuộc tính');
        }
    };

    const handleEdit = (attr) => {
        setForm({ name: attr.name, key: attr.key, type: attr.type });
        setEditingId(attr._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
            await axios.delete(`http://localhost:5000/api/attributes/${id}`);
            fetchAttributes();
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Quản lý thuộc tính</h2>
            <form className={cx('form')} onSubmit={handleSubmit}>
                <input
                    className={cx('input')}
                    placeholder="Tên hiển thị (VD: RAM)"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <input
                    className={cx('input')}
                    placeholder="Tên khóa (vd: ram)"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    required
                />
                <select
                    className={cx('select')}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                </select>
                <button type="submit" className={cx('submitBtn')}>
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </form>

            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Key</th>
                        <th>Loại</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {attributes.map((attr) => (
                        <tr key={attr._id}>
                            <td>{attr.name}</td>
                            <td>{attr.key}</td>
                            <td>{attr.type}</td>
                            <td>
                                <button className={cx('editBtn')} onClick={() => handleEdit(attr)}>
                                    Sửa
                                </button>
                                <button className={cx('deleteBtn')} onClick={() => handleDelete(attr._id)}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AttributeManagement;
