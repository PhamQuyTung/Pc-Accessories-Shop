import React, { useState, useEffect } from 'react';
import styles from './PostsPage.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Xóa bài viết
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        try {
            await axiosClient.delete(`/posts/${id}`);
            setPosts((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            console.error('❌ Lỗi khi xóa post:', err);
            alert('Xóa bài viết thất bại!');
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
