import React, { useState, useEffect } from 'react';
import styles from './PostTagPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const PostCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });

    // Lấy categories từ backend khi load trang
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/post-categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Lỗi khi load categories:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/post-categories', newCategory);
            fetchCategories(); // reload lại list sau khi thêm
            setNewCategory({ name: '', slug: '', description: '' });
        } catch (err) {
            console.error('Lỗi khi thêm category:', err);
        }
    };

    return (
        <div className={cx('posts-page')}>
            <h1 className={cx('title')}>Chuyên mục</h1>

            <div className={cx('two-columns')}>
                {/* Form thêm chuyên mục */}
                <form onSubmit={handleSubmit} className={cx('post-form')}>
                    <h2>Thêm chuyên mục mới</h2>
                    <div className={cx('form-group')}>
                        <label>Tên</label>
                        <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Slug</label>
                        <input
                            type="text"
                            value={newCategory.slug}
                            onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mô tả</label>
                        <textarea
                            rows={3}
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                    </div>
                    <button type="submit" className={cx('btn-submit')}>
                        Thêm chuyên mục
                    </button>
                </form>

                {/* Danh sách chuyên mục */}
                <div className={cx('table-wrapper')}>
                    <h2>Danh sách chuyên mục</h2>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Slug</th>
                                <th>Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat._id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.slug}</td>
                                    <td>{cat.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PostCategoryPage;
