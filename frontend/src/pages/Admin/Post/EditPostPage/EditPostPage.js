import React, { useState, useEffect } from 'react';
import styles from './EditPostPage.module.scss';
import classNames from 'classnames/bind';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const EditPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openTags, setOpenTags] = useState(false);

    // Fetch categories và tags
    useEffect(() => {
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

        fetchCategories();
        fetchTags();
    }, []);

    // Fetch bài viết
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost({
                    ...res.data,
                    category: res.data.category || '',
                    tags: res.data.tags || [],
                });
            } catch (err) {
                console.error('❌ Lỗi khi tải bài viết:', err);
            }
        };
        fetchPost();
    }, [id]);

    const handleAddTag = (tag) => {
        if (!post.tags.includes(tag)) {
            setPost({ ...post, tags: [...post.tags, tag] });
        }
    };

    const handleRemoveTag = (tag) => {
        setPost({ ...post, tags: post.tags.filter((t) => t !== tag) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...post,
                category: post.category,
                tags: post.tags,
            };

            await axiosClient.put(`/posts/${id}`, payload);
            alert('✅ Cập nhật thành công!');
            navigate('/admin/posts');
        } catch (err) {
            console.error('❌ Lỗi khi cập nhật bài viết:', err);
            alert('Cập nhật thất bại!');
        }
    };

    if (!post) return <p>Đang tải...</p>;

    return (
        <div className={cx('posts-page')}>
            <h1 className={cx('title')}>Chỉnh sửa bài viết</h1>

            <form onSubmit={handleSubmit} className={cx('post-form')}>
                {/* Ảnh đại diện */}
                <div className={cx('form-group')}>
                    <label>Ảnh đại diện</label>
                    <input
                        type="text"
                        value={post.image || ''}
                        placeholder="Dán link ảnh đại diện"
                        onChange={(e) => setPost({ ...post, image: e.target.value })}
                    />
                    {post.image && (
                        <div className={cx('preview')}>
                            <img src={post.image} alt="preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                        </div>
                    )}
                </div>

                {/* Tiêu đề */}
                <div className={cx('form-group')}>
                    <label>Tiêu đề</label>
                    <input
                        type="text"
                        value={post.title}
                        onChange={(e) => setPost({ ...post, title: e.target.value })}
                        required
                    />
                </div>

                {/* Danh mục */}
                <div className={cx('form-group')}>
                    <label>Chuyên mục</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenCategory(!openCategory)}>
                            {post.category || 'Chọn chuyên mục'}
                            <span className={cx('arrow')}>▼</span>
                        </div>
                        {openCategory && (
                            <ul className={cx('select-options')}>
                                {categories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => {
                                            setPost({ ...post, category: cat.slug });
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
                                    <li key={tag._id} onClick={() => handleAddTag(tag.slug)}>
                                        {tag.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Hiển thị tags đã chọn */}
                    <div className={cx('selected-tags')}>
                        {post.tags.map((tag) => (
                            <span key={tag} className={cx('tag-badge')}>
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)}>
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <button type="submit" className={cx('btn-submit')}>
                    Cập nhật
                </button>
            </form>
        </div>
    );
};

export default EditPostPage;
