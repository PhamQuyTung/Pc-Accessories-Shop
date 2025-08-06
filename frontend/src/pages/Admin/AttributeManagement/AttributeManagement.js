import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AttributeManagement.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager/ToastMessager'; // hook toast của bạn

const cx = classNames.bind(styles);

const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'select', label: 'Select' },
    { value: 'button', label: 'Button' },
    { value: 'color', label: 'Color' },
    { value: 'image', label: 'Image' },
];

function AttributeManagement() {
    const [attributes, setAttributes] = useState([]);
    const [form, setForm] = useState({ name: '', key: '', type: 'text' });
    const [editingId, setEditingId] = useState(null);
    const toast = useToast(); // sử dụng hook

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/attributes');
            setAttributes(res.data);
        } catch (err) {
            toast('Không thể tải danh sách thuộc tính', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/attributes/${editingId}`, form);
                toast('Cập nhật thuộc tính thành công!', 'success');
            } else {
                await axios.post('http://localhost:5000/api/attributes', form);
                toast('Thêm thuộc tính thành công!', 'success');
            }
            setForm({ name: '', key: '', type: 'text' });
            setEditingId(null);
            fetchAttributes();
        } catch (err) {
            toast('Lỗi khi lưu thuộc tính!', 'error');
        }
    };

    const handleEdit = (attr) => {
        setForm({ name: attr.name, key: attr.key, type: attr.type });
        setEditingId(attr._id);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Bạn có chắc chắn muốn xóa thuộc tính này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/attributes/${id}`);
                toast('Xóa thuộc tính thành công!', 'success');
                fetchAttributes();
            } catch (err) {
                toast('Lỗi khi xóa thuộc tính!', 'error');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2 className={cx('title')}>Quản lý thuộc tính</h2>

                {/* Button link gán thuộc tính vào danh mục */}
                <Link to="/admin/attributes/assign" className={cx('assignBtn')}>
                    + Thêm thuộc tính vào danh mục
                </Link>
            </div>

            <div className={cx('wrapper-container')}>
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
                        {ATTRIBUTE_TYPES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
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
                                <td className={cx('custom')}>
                                    <button className={cx('editBtn')} onClick={() => handleEdit(attr)}>
                                        Sửa
                                    </button>
                                    <button className={cx('deleteBtn')} onClick={() => handleDelete(attr._id)}>
                                        Xóa
                                    </button>
    
                                    {/* Nếu là loại select thì hiện nút "Chủng loại" */}
                                    {['select', 'button', 'color', 'image'].includes(attr.type) && (
                                        <Link
                                            to={`/admin/attributes/${attr._id}/terms?name=${encodeURIComponent(attr.name)}`}
                                            className={cx('variantBtn')}
                                        >
                                            Chủng loại
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AttributeManagement;
