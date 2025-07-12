import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AdminMenuManagement.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function AdminMenuManagement() {
    const [menus, setMenus] = useState([]);
    const [newMenu, setNewMenu] = useState({ name: '', slug: '', link: '', parent: '' });
    const [editingMenuId, setEditingMenuId] = useState(null);

    const fetchMenus = async () => {
        const res = await axios.get('http://localhost:5000/api/menus');
        console.log('Danh sách menu:', res.data); // ✅ Thêm dòng này
        setMenus(res.data);
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleSubmit = async () => {
        try {
            if (!newMenu.name || !newMenu.slug || !newMenu.link) {
                toast.error('Vui lòng nhập đầy đủ Tên, Slug và Link!');
                return;
            }
            if (editingMenuId) {
                await axios.put(`http://localhost:5000/api/menus/${editingMenuId}`, newMenu);
            } else {
                await axios.post('http://localhost:5000/api/menus', newMenu);
            }
            toast.success(editingMenuId ? 'Cập nhật menu thành công!' : 'Thêm menu thành công!');
            setNewMenu({ name: '', slug: '', link: '', parent: '' });
            setEditingMenuId(null);
            fetchMenus();
        } catch (err) {
            console.error('Lỗi:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleCancelEdit = () => {
        setEditingMenuId(null);
        setNewMenu({ name: '', slug: '', link: '', parent: '' });
        toast.info('Đã hủy chỉnh sửa menu.');
    };

    const handleEdit = (menu) => {
        setNewMenu({
            name: menu.name,
            slug: menu.slug,
            link: menu.link,
            parent: menu.parent || '',
        });
        setEditingMenuId(menu._id);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: 'Thao tác này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            await axios.delete(`http://localhost:5000/api/menus/${id}`);
            toast.success('Xóa menu thành công!');
            fetchMenus();
        }
    };

    const renderMenuTree = (menuList, parent = null, level = 0) => {
        return menuList
            .filter((menu) => String(menu.parent) === String(parent))
            .map((menu) => (
                <div
                    key={menu._id}
                    style={{ paddingLeft: `${level * 20}px` }}
                    className={cx({ editing: editingMenuId === menu._id })}
                >
                    <strong>{menu.name}</strong> ({menu.slug})<button onClick={() => handleEdit(menu)}>Sửa</button>
                    <button onClick={() => handleDelete(menu._id)}>Xóa</button>
                    {renderMenuTree(menuList, menu._id, level + 1)}
                </div>
            ));
    };

    const generateNestedOptions = (menuList, parent = null, level = 0) => {
        return menuList
            .filter((menu) => String(menu.parent) === String(parent))
            .flatMap((menu) => [
                <option key={menu._id} value={menu._id}>
                    {'--'.repeat(level) + ' ' + menu.name}
                </option>,
                ...generateNestedOptions(menuList, menu._id, level + 1),
            ]);
    };

    return (
        <div className={cx('wrapper')}>
            <h2>Quản lý menu</h2>

            <div className={cx('content')}>
                <div className={cx('form')}>
                    <input
                        type="text"
                        placeholder="Tên menu"
                        value={newMenu.name}
                        onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Link (ví dụ: /about)"
                        value={newMenu.link}
                        onChange={(e) => setNewMenu({ ...newMenu, link: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Slug (ví dụ: laptop)"
                        value={newMenu.slug}
                        onChange={(e) => setNewMenu({ ...newMenu, slug: e.target.value })}
                    />

                    <select value={newMenu.parent} onChange={(e) => setNewMenu({ ...newMenu, parent: e.target.value })}>
                        <option value="">-- Menu cha --</option>
                        {generateNestedOptions(menus)}
                    </select>

                    <div className={cx('form-buttons')}>
                        {editingMenuId ? (
                            <>
                                <button onClick={handleSubmit}>Cập nhật menu</button>
                                <button onClick={handleCancelEdit} className={cx('cancel-button')}>
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button onClick={handleSubmit}>Thêm menu</button>
                        )}
                    </div>
                </div>

                <div className={cx('menu-list')}>
                    <h3>Danh sách menu</h3>
                    {renderMenuTree(menus)}
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}

export default AdminMenuManagement;
