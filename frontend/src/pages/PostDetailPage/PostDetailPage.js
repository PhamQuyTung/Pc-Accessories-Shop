import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PostDetailPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const PostDetailPage = () => {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost(res.data);

                // Gọi API để lấy bài viết liên quan
                fetchRelatedPosts(res.data.category, res.data._id);

                // Gọi API để lấy comment
                fetchComments();
            } catch (err) {
                console.error('❌ Lỗi tải bài viết:', err);
            }
        };
        fetchPost();
    }, [id]);

    const fetchRelatedPosts = async (category, currentId) => {
        try {
            const res = await axiosClient.get(`/posts?category=${category}`);
            const filtered = res.data.filter((p) => p._id !== currentId);
            setRelatedPosts(filtered.slice(0, 4)); // lấy tối đa 4 bài
        } catch (err) {
            console.error('❌ Lỗi tải related posts:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`/reviews/post/${id}`);
            setComments(res.data);
        } catch (err) {
            console.error('❌ Lỗi tải comments:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await axiosClient.post(`/reviews/post/${id}`, { comment: newComment, rating });
            setNewComment('');
            fetchComments();
            setRating(0);
        } catch (err) {
            console.error('❌ Lỗi gửi comment:', err);
            alert('Bạn cần đăng nhập để bình luận!');
        }
    };

    if (!post) return <p>Đang tải bài viết...</p>;

    return (
        <div className={cx('post-detail')}>
            <div className={cx('container')}>
                <Link to="/blog" className={cx('back')}>
                    ← Quay lại
                </Link>

                <h1 className={cx('title')}>{post.title}</h1>

                <div className={cx('meta')}>
                    <span>🖊 {post.author || 'Admin'}</span>
                    <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className={cx('category')}>{post.category}</span>
                </div>

                {post.image && (
                    <div className={cx('thumb')}>
                        <img src={post.image} alt={post.title} />
                    </div>
                )}

                <div className={cx('content')}>{post.content}</div>

                {post.tags?.length > 0 && (
                    <div className={cx('tags')}>
                        {post.tags.map((tag, idx) => (
                            <span key={idx} className={cx('tag')}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 💬 Comment Section */}
                <div className={cx('comments')}>
                    <h2>Bình luận ({comments.length})</h2>

                    {/* Form nhập comment */}
                    <div className={cx('comment-form')}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nhập bình luận của bạn..."
                        />

                        <div className={cx('rating-input')}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={rating >= star ? cx('star', 'active') : cx('star')}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <button onClick={handleAddComment}>Đăng bình luận</button>
                    </div>

                    {/* Danh sách comment */}
                    <div className={cx('comment-list')}>
                        {comments.map((c) => (
                            <div key={c._id} className={cx('comment-item')}>
                                <img
                                    src={c.user?.avatar || '/default-avatar.png'}
                                    alt={c.user?.name}
                                    className={cx('avatar')}
                                />
                                <div className={cx('comment-body')}>
                                    <div className={cx('comment-header')}>
                                        <strong className={cx('username')}>{c.user?.name || 'Người dùng'}</strong>
                                        <span className={cx('date')}>
                                            {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    {/* Nếu có rating */}
                                    {c.rating && (
                                        <div className={cx('rating')}>
                                            {'★'.repeat(c.rating)}
                                            {'☆'.repeat(5 - c.rating)}
                                        </div>
                                    )}

                                    <p className={cx('text')}>{c.comment}</p>

                                    {/* Nếu có ảnh đính kèm */}
                                    {c.images?.length > 0 && (
                                        <div className={cx('comment-images')}>
                                            {c.images.map((img, idx) => (
                                                <img key={idx} src={img} alt="attachment" />
                                            ))}
                                        </div>
                                    )}

                                    <div className={cx('actions')}>
                                        <button>👍 Hữu ích</button>
                                        <button>👎 Không hữu ích</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔥 Bài viết liên quan */}
                {relatedPosts.length > 0 && (
                    <div className={cx('related-posts')}>
                        <h2>Bài viết liên quan</h2>
                        <div className={cx('related-grid')}>
                            {relatedPosts.map((rp) => (
                                <Link key={rp._id} to={`/blog/${rp._id}`} className={cx('related-card')}>
                                    <div className={cx('thumbnail')}>
                                        <img src={rp.image || '/default-thumbnail.jpg'} alt={rp.title} />
                                    </div>
                                    <h3>{rp.title}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetailPage;
