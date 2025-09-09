import React, { useState, useEffect } from 'react';
import styles from './PostTagPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const PostTagPage = () => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState({ name: '', slug: '' });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await axiosClient.get('/post-tags');
            setTags(res.data);
        } catch (err) {
            console.error('Lỗi khi load tags:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/post-tags', newTag);
            fetchTags();
            setNewTag({ name: '', slug: '' });
        } catch (err) {
            console.error('Lỗi khi thêm tag:', err);
        }
    };

    return (
        <div className={cx('posts-page')}>
            <h1 className={cx('title')}>Thẻ</h1>

            <div className={cx('two-columns')}>
                {/* Form thêm thẻ */}
                <form onSubmit={handleSubmit} className={cx('post-form')}>
                    <h2>Thêm thẻ mới</h2>
                    <div className={cx('form-group')}>
                        <label>Tên</label>
                        <input
                            type="text"
                            value={newTag.name}
                            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Slug</label>
                        <input
                            type="text"
                            value={newTag.slug}
                            onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                        />
                    </div>
                    <button type="submit" className={cx('btn-submit')}>
                        Thêm thẻ
                    </button>
                </form>

                {/* Danh sách thẻ */}
                <div className={cx('table-wrapper')}>
                    <h2>Danh sách thẻ</h2>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Slug</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((tag) => (
                                <tr key={tag._id}>
                                    <td>{tag.name}</td>
                                    <td>{tag.slug}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PostTagPage;
