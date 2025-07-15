import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AssignAttributeToCategory.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager'; // Sử dụng hook toast

const cx = classNames.bind(styles);

function AssignAttributeToCategory() {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const toast = useToast();

    const fetchCategories = async () => {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
    };

    useEffect(() => {
        fetchCategories();
        axios.get('http://localhost:5000/api/categories').then((res) => setCategories(res.data));
        axios.get('http://localhost:5000/api/attributes').then((res) => setAttributes(res.data));
    }, []);

    useEffect(() => {
        if (!selectedCategory) {
            setSelectedAttributes([]);
            return;
        }

        // Gọi API để lấy chi tiết danh mục đã chọn
        axios
            .get(`http://localhost:5000/api/categories/${selectedCategory}`)
            .then((res) => {
                const currentAttrIds = res.data.attributes || [];
                // Nếu attribute là object thì map _id, nếu là string thì giữ nguyên
                setSelectedAttributes(currentAttrIds.map((attr) => (typeof attr === 'string' ? attr : attr._id)));
            })
            .catch((err) => {
                console.error('Lỗi khi lấy thuộc tính của danh mục:', err);
                toast('Không lấy được dữ liệu thuộc tính!', 'error');
            });
    }, [selectedCategory]);

    const handleAssign = async () => {
        if (!selectedCategory) {
            toast('Vui lòng chọn danh mục!', 'warning');
            return;
        }

        if (selectedAttributes.length === 0) {
            toast('Vui lòng chọn ít nhất một thuộc tính!', 'warning');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/categories/assign-attributes', {
                categoryId: selectedCategory,
                attributes: selectedAttributes,
            });

            toast('Gán thuộc tính thành công!', 'success');

            // ✅ Reload lại danh mục để bảng cập nhật
            await fetchCategories();

            // ✅ Reset form
            setSelectedCategory('');
            setSelectedAttributes([]);
        } catch (err) {
            console.error('Lỗi:', err);
            toast('Lỗi khi gán thuộc tính!', 'error');
        }
    };

    const handleCheckboxChange = (attrId) => {
        setSelectedAttributes((prev) =>
            prev.includes(attrId) ? prev.filter((id) => id !== attrId) : [...prev, attrId],
        );
    };

    const handleRemoveAttribute = async (categoryId, attributeId) => {
        const confirm = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Thuộc tính này sẽ bị gỡ khỏi danh mục!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Gỡ',
            cancelButtonText: 'Hủy',
        });

        if (confirm.isConfirmed) {
            try {
                await axios.post('http://localhost:5000/api/categories/remove-attribute', {
                    categoryId,
                    attributeId,
                });
                toast('Gỡ thuộc tính thành công!', 'success');
                await fetchCategories(); // Cập nhật lại bảng
            } catch (error) {
                console.error('Lỗi khi gỡ thuộc tính:', error);
                toast('Gỡ thuộc tính thất bại!', 'error');
            }
        }
    };

    return (
        <div className={cx('container')}>
            {/* Cột bên trái: Gán thuộc tính */}
            <div className={cx('left-panel')}>
                <p className={cx('header')}>
                    <h2 className={cx('title')}>Gán thuộc tính vào danh mục</h2>
                    <a
                        href="/admin/attributes"
                        className={cx('manage-link')}
                        style={{
                            marginLeft: 'auto',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            color: '#007bff',
                        }}
                    >
                        Quản lý thuộc tính →
                    </a>
                </p>

                <label className={cx('label')}>Chọn danh mục:</label>
                <select
                    className={cx('select')}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <div className={cx('attribute-section')}>
                    <h4 className={cx('subtitle')}>Danh sách thuộc tính:</h4>
                    {attributes.map((attr) => (
                        <label key={attr._id} className={cx('checkbox')}>
                            <input
                                type="checkbox"
                                checked={selectedAttributes.includes(attr._id)}
                                onChange={() => handleCheckboxChange(attr._id)}
                            />
                            {attr.name} ({attr.key})
                        </label>
                    ))}
                </div>

                <button className={cx('assign-btn')} onClick={handleAssign}>
                    Gán thuộc tính
                </button>
            </div>

            {/* Cột bên phải: Danh sách đã gán */}
            <div className={cx('right-panel')}>
                <h3>Thuộc tính đã được gán</h3>
                <table className={cx('assigned-table')}>
                    <thead>
                        <tr>
                            <th>Danh mục</th>
                            <th>Thuộc tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories
                            .filter((cat) => cat.attributes && cat.attributes.length > 0)
                            .map((cat) => (
                                <tr key={cat._id}>
                                    <td>{cat.name}</td>
                                    <td>
                                        {(cat.attributes || []).map((attr) => (
                                            <div key={attr._id} className={cx('attr-item')}>
                                                {attr.name} ({attr.key})
                                                <button
                                                    className={cx('remove-btn')}
                                                    onClick={() => handleRemoveAttribute(cat._id, attr._id)}
                                                >
                                                    Gỡ
                                                </button>
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AssignAttributeToCategory;
