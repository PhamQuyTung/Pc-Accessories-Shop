import React, { useState, useEffect } from 'react';
import styles from './CreatePostPage.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import { successAlert, errorAlert } from '~/utils/alertSweet';
import { useToast } from '~/components/ToastMessager/ToastMessager';

const cx = classNames.bind(styles);

const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openTags, setOpenTags] = useState(false);

    const [image, setImage] = useState('');

    const navigate = useNavigate();

    const showToast = useToast();

    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/post-categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Lỗi load categories:', err);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await axiosClient.get('/post-tags');
            setTags(res.data);
        } catch (err) {
            console.error('Lỗi load tags:', err);
        }
    };

    const handleAddTag = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tag) => {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                content,
                category,
                tags: selectedTags,
                image,
            };

            await axiosClient.post('/posts', payload);
            // successAlert("Bài viết đã được tạo!");
            showToast('Bài viết đã được tạo!', 'success');
            navigate('/admin/posts');
        } catch (err) {
            console.error('❌ Lỗi tạo bài viết:', err);
            // errorAlert("Tạo bài viết thất bại!");
            showToast('Tạo bài viết thất bại!', 'error');
        }
    };

    return (
        <div className={cx('posts-page')}>
            <h1 className={cx('title')}>Viết bài mới</h1>

            <form onSubmit={handleSubmit} className={cx('post-form')}>
                {/* Ảnh đại diện */}
                <div className={cx('form-group')}>
                    <label>Ảnh đại diện</label>
                    <input
                        type="text"
                        placeholder="Dán link ảnh hoặc upload"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />
                </div>

                {/* Tiêu đề */}
                <div className={cx('form-group')}>
                    <label>Tiêu đề</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                {/* Nội dung */}
                <div className={cx('form-group')}>
                    <label>Nội dung</label>
                    <textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>

                {/* Danh mục */}
                <div className={cx('form-group')}>
                    <label>Chuyên mục</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenCategory(!openCategory)}>
                            {categories.find((c) => c._id === category)?.name || 'Chọn chuyên mục'}
                            <span className={cx('arrow')}>▼</span>
                        </div>

                        {openCategory && (
                            <ul className={cx('select-options')}>
                                {categories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => {
                                            setCategory(cat._id);
                                            setOpenCategory(false);
                                        }}
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Thẻ */}
                <div className={cx('form-group')}>
                    <label>Thẻ</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenTags(!openTags)}>
                            Thêm thẻ...
                            <span className={cx('arrow')}>▼</span>
                        </div>
                        {openTags && (
                            <ul className={cx('select-options')}>
                                {tags.map((tag) => (
                                    <li key={tag._id} onClick={() => handleAddTag(tag._id)}>
                                        {tag.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Hiển thị tags đã chọn */}
                    <div className={cx('selected-tags')}>
                        {selectedTags.map((tagId) => {
                            const tag = tags.find((t) => t._id === tagId);
                            return (
                                <span key={tagId} className={cx('tag-badge')}>
                                    {tag?.name || tagId}
                                    <button type="button" onClick={() => handleRemoveTag(tagId)}>
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className={cx('btn-submit')}>
                    Đăng bài
                </button>
            </form>
        </div>
    );
};

export default CreatePostPage;
