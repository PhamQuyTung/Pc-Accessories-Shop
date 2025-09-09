import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PostDetailPage.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCalendar, faComment, faFolder, faThumbsDown, faThumbsUp, faUser } from '@fortawesome/free-regular-svg-icons';

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

                {/* Title */}
                <h1 className={cx('title')}>{post.title}</h1>

                {/* Meta */}
                <div className={cx('meta')}>
                    <span className={cx('author')}>
                        <FontAwesomeIcon icon={faUser} />
                        <p>
                            {post.author?.name ||
                                `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() ||
                                'Người dùng'}
                        </p>
                    </span>

                    <span className={cx('category')}>
                        <FontAwesomeIcon icon={faFolder} />
                        <p>{post.category}</p>
                    </span>

                    <span className={cx('date')}>
                        <FontAwesomeIcon icon={faCalendar} />
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    <span className={cx('comments-count')}>
                        <FontAwesomeIcon icon={faComment} />
                        <p>{comments.length} bình luận</p>
                    </span>
                </div>

                {/* Ảnh post đại diện */}
                {post.image && (
                    <div className={cx('thumb')}>
                        <img src={post.image} alt={post.title} />
                    </div>
                )}

                {/* Nội dung bài viết */}
                <div className={cx('content')}>{post.content}</div>

                {/* Tags & share post */}
                <div className={cx('th-section')}>
                    {/* Tags Section */}
                    <div className={cx('tags-section')}>
                        <h3>Thẻ:</h3>
                        {post.tags?.length > 0 && (
                            <div className={cx('tags')}>
                                {post.tags.map((tag, idx) => (
                                    <span key={idx} className={cx('tag')}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Share Section */}
                    <div className={cx('share-section')}>
                        <h3>Chia sẻ bài viết này:</h3>
                        <div className={cx('share-icons')}>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FontAwesomeIcon icon={faFacebook} />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                            <a
                                href={`https://www.linkedin.com/shareArticle?url=${window.location.href}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FontAwesomeIcon icon={faLinkedin} />
                            </a>
                            <a href={`https://www.instagram.com/`} target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* 💬 Comment Section */}
                <div className={cx('comments')}>
                    <h2>Bình luận ({comments.length})</h2>

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
                                    <div className={cx('comment-meta')}>
                                        <div className={cx('comment-header')}>
                                            <h6 className={cx('username')}>{c.user?.name || 'Người dùng'}</h6>
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
                                    </div>

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
                                        <button className={cx('helpful-btn')}>
                                            <FontAwesomeIcon icon={faThumbsUp} />
                                            Hữu ích
                                        </button>
                                        <button className={cx('helpful-btn')}>
                                            <FontAwesomeIcon icon={faThumbsDown} />
                                            Không hữu ích
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form nhập comment */}
                    <div className={cx('comment-form')}>
                        <h4>Thêm bình luận của bạn:</h4>

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
