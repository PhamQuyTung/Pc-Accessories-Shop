import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AssignAttributeToCategory.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function AssignAttributeToCategory() {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/categories').then((res) => setCategories(res.data));
        axios.get('http://localhost:5000/api/attributes').then((res) => setAttributes(res.data));
    }, []);

    const handleAssign = async () => {
        try {
            await axios.post('http://localhost:5000/api/categories/assign-attributes', {
                categoryId: selectedCategory,
                attributes: selectedAttributes,
            });
            alert('Gán thành công!');
        } catch (err) {
            console.error('Lỗi:', err);
            alert('Lỗi khi gán thuộc tính!');
        }
    };

    const handleCheckboxChange = (attrId) => {
        setSelectedAttributes((prev) =>
            prev.includes(attrId) ? prev.filter((id) => id !== attrId) : [...prev, attrId],
        );
    };

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Gán thuộc tính vào danh mục</h2>
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
    );
}

export default AssignAttributeToCategory;
