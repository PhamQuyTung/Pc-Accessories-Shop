import React, { useState, useEffect } from 'react';
import styles from './EditPostPage.module.scss';
import classNames from 'classnames/bind';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import { confirmAlert } from '~/utils/alertSweet';
import { useToast } from '~/components/ToastMessager/ToastMessager';

const cx = classNames.bind(styles);

const EditPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openTags, setOpenTags] = useState(false);

    const showToast = useToast();

    // Fetch categories và tags
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosClient.get('/post-categories');
                setCategories(res.data);
            } catch (err) {
                console.error('❌ Lỗi load categories:', err);
            }
        };

        const fetchTags = async () => {
            try {
                const res = await axiosClient.get('/post-tags');
                setTags(res.data);
            } catch (err) {
                console.error('❌ Lỗi load tags:', err);
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
                    category: res.data.category?._id || '',
                    tags: res.data.tags?.map((t) => t._id) || [],
                });
            } catch (err) {
                console.error('❌ Lỗi khi tải bài viết:', err);
            }
        };
        fetchPost();
    }, [id]);

    const handleAddTag = (tagId) => {
        if (!post.tags.includes(tagId)) {
            setPost({ ...post, tags: [...post.tags, tagId] });
        }
    };

    const handleRemoveTag = (tagId) => {
        setPost({ ...post, tags: post.tags.filter((t) => t !== tagId) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await confirmAlert('Xác nhận cập nhật?', 'Bạn có chắc muốn lưu thay đổi?');
        if (!result.isConfirmed) return;

        try {
            const payload = {
                ...post,
                category: post.category, // _id
                tags: post.tags, // array of _id
            };

            await axiosClient.put(`/posts/${id}`, payload);
            showToast('✅ Cập nhật thành công!', 'success');
            navigate('/admin/posts');
        } catch (err) {
            console.error('❌ Lỗi khi cập nhật bài viết:', err);
            showToast('Cập nhật thất bại!', 'error');
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
                            {categories.find((c) => c._id === post.category)?.name || 'Chọn chuyên mục'}
                            <span className={cx('arrow')}>▼</span>
                        </div>
                        {openCategory && (
                            <ul className={cx('select-options')}>
                                {categories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => {
                                            setPost({ ...post, category: cat._id });
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
                        {post.tags.map((tagId) => {
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

                <button type="submit" className={cx('btn-submit')}>
                    Cập nhật
                </button>
            </form>
        </div>
    );
};

export default EditPostPage;
