import React, { useState, useEffect } from 'react';
import styles from './PostsPage.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Star } from 'lucide-react';
import axiosClient from '~/utils/axiosClient';
import { confirmAlert } from '~/utils/alertSweet';
import { useToast } from '~/components/ToastMessager/ToastMessager';

const cx = classNames.bind(styles);

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const showToast = useToast();

    // Lấy danh sách bài viết
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get('/posts'); // tự động prepend API_BASE_URL
                setPosts(res.data);
            } catch (err) {
                console.error('❌ Lỗi khi fetch posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Xóa (chuyển vào thùng rác)
    const handleDelete = async (id) => {
        const result = await confirmAlert(
            'Chuyển vào thùng rác?',
            'Bài viết sẽ được đưa vào thùng rác',
        );
        if (!result.isConfirmed) return;

        try {
            await axiosClient.put(`/posts/${id}`, { status: 'trash' });
            setPosts((prev) => prev.filter((p) => p._id !== id));
            showToast('🗑️ Đã chuyển bài viết vào thùng rác!', 'success');
        } catch (err) {
            console.error('❌ Lỗi khi chuyển vào thùng rác:', err);
            showToast('Không thể xóa bài viết!', 'error');
        }
    };

    // Toggle featured
    const handleToggleFeatured = async (id) => {
        try {
            const res = await axiosClient.patch(`/posts/${id}/toggle-featured`);
            setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, isFeatured: res.data.post.isFeatured } : p)));
            showToast(
                res.data.post.isFeatured ? 'Đã bật nổi bật cho bài viết!' : 'Đã tắt nổi bật cho bài viết!',
                'success',
            );
        } catch (err) {
            console.error('❌ Lỗi toggle featured:', err);
            showToast('Không thể thay đổi trạng thái nổi bật!', 'error');
        }
    };

    if (loading) return <p>Đang tải bài viết...</p>;

    return (
        <div className={cx('posts-page')}>
            {/* Header */}
            <div className={cx('header')}>
                <h1 className={cx('title')}>Bài viết</h1>
                <Link to="/admin/posts/create" className={cx('btn-new')}>
                    <PlusCircle size={16} /> Viết bài mới
                </Link>
            </div>

            {/* Table */}
            <table className={cx('posts-table')}>
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" />
                        </th>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Chuyên mục</th>
                        <th>Thẻ</th>
                        <th>Nổi bật</th>
                        <th>Ngày</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <tr key={post._id}>
                                <td>
                                    <input type="checkbox" />
                                </td>

                                <td>
                                    <strong>{post.title}</strong>
                                    <div className={cx('row-actions')}>
                                        <Link to={`/admin/posts/edit/${post._id}`}>
                                            <Edit size={14} /> Sửa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(post._id)}
                                            className={cx('btn-delete')}
                                        >
                                            <Trash2 size={14} /> Xóa
                                        </button>
                                    </div>
                                </td>

                                <td>
                                    {post.author?.name ||
                                        `${post.author?.firstName || ''} ${post.author?.lastName || ''}`}
                                </td>

                                <td>{post.category?.name || '—'}</td>

                                <td>{post.tags?.map((tag) => tag.name).join(', ') || '—'}</td>

                                {/* Nút toggle featured */}
                                <td>
                                    <button
                                        type="button"
                                        className={cx('btn-featured', { active: post.isFeatured })}
                                        onClick={() => handleToggleFeatured(post._id)}
                                    >
                                        <Star size={16} />
                                        {post.isFeatured ? 'Nổi bật' : 'Bình thường'}
                                    </button>
                                </td>

                                <td>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">Không có bài viết nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PostsPage;
