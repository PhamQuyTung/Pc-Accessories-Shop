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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost({
                    ...res.data,
                    tags: res.data.tags?.join(', ') || '',
                });
            } catch (err) {
                console.error('❌ Lỗi khi tải bài viết:', err);
            }
        };
        fetchPost();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...post,
                tags: post.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
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

                {/* Nội dung */}
                <div className={cx('form-group')}>
                    <label>Nội dung</label>
                    <textarea
                        rows={10}
                        value={post.content}
                        onChange={(e) => setPost({ ...post, content: e.target.value })}
                        required
                    />
                </div>

                {/* Danh mục */}
                <div className={cx('form-group')}>
                    <label>Chuyên mục</label>
                    <input
                        type="text"
                        value={post.category}
                        onChange={(e) => setPost({ ...post, category: e.target.value })}
                    />
                </div>

                {/* Thẻ */}
                <div className={cx('form-group')}>
                    <label>Thẻ</label>
                    <input
                        type="text"
                        value={post.tags}
                        onChange={(e) => setPost({ ...post, tags: e.target.value })}
                        placeholder="Ngăn cách bằng dấu phẩy"
                    />
                </div>

                <button type="submit" className={cx('btn-submit')}>
                    Cập nhật
                </button>
            </form>
        </div>
    );
};

export default EditPostPage;
