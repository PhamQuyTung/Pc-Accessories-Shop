import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PostDetailPage.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCalendar, faComment, faFolder, faThumbsDown, faThumbsUp, faUser } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const PostDetailPage = () => {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);

    // Lấy categories, tags, featured posts cho sidebar
    useEffect(() => {
        // Lấy categories
        const fetchCategories = async () => {
            try {
                const res = await axiosClient.get('/post-categories');
                setCategories(res.data);
            } catch (err) {
                console.error('❌ Lỗi tải categories:', err);
            }
        };

        // Lấy tags
        const fetchTags = async () => {
            try {
                const res = await axiosClient.get('/post-tags');
                setTags(res.data);
            } catch (err) {
                console.error('❌ Lỗi tải tags:', err);
            }
        };

        // Lấy bài viết nổi bật (ví dụ: isFeatured = true)
        const fetchFeaturedPosts = async () => {
            try {
                const res = await axiosClient.get('/posts/featured');
                setFeaturedPosts(res.data);
            } catch (err) {
                console.error('❌ Lỗi tải featured posts:', err);
            }
        };

        fetchCategories();
        fetchTags();
        fetchFeaturedPosts();
    }, []);

    // Lấy chi tiết bài viết
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost(res.data);

                // Gọi API để lấy bài viết liên quan (theo category._id)
                fetchRelatedPosts(res.data.category?._id, res.data._id);

                // Lấy comment
                fetchComments();
            } catch (err) {
                console.error('❌ Lỗi tải bài viết:', err);
            }
        };
        fetchPost();
    }, [id]);

    // Lấy bài viết liên quan
    const fetchRelatedPosts = async (categoryId, currentId) => {
        if (!categoryId) return;
        try {
            const res = await axiosClient.get(`/posts?category=${categoryId}`);
            const filtered = res.data.filter((p) => p._id !== currentId);
            setRelatedPosts(filtered.slice(0, 4));
        } catch (err) {
            console.error('❌ Lỗi tải related posts:', err);
        }
    };

    // Lấy comments
    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`/reviews/post/${id}`);
            setComments(res.data);
        } catch (err) {
            console.error('❌ Lỗi tải comments:', err);
        }
    };

    // Thêm comment mới
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

    // Nếu chưa tải xong post
    if (!post) return <p>Đang tải bài viết...</p>;

    return (
        <div className={cx('post-detail')}>
            <div className={cx('container')}>
                {/* Post Content */}
                <div className={cx('content-wrapper')}>
                    <Link to="/blog" className={cx('back')}>
                        ← Quay lại
                    </Link>

                    <div className={cx('post-info')}>
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
                                <p>{post.category?.name || 'Chưa phân loại'}</p>
                            </span>

                            <span className={cx('comments-count')}>
                                <FontAwesomeIcon icon={faComment} />
                                <p>{comments.length} bình luận</p>
                            </span>

                            <span className={cx('date')}>
                                <FontAwesomeIcon icon={faCalendar} />
                                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
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
                            {post.tags?.length > 0 ? (
                                <div className={cx('tags')}>
                                    {post.tags.map((tag) => (
                                        <span key={tag._id} className={cx('tag')}>
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>—</p>
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

                {/* Sidebar Right */}
                <aside className={cx('sidebar')}>
                    {/* 🔎 Search */}
                    <div className={cx('sidebar-widget')}>
                        <h3 className={cx('sidebar-title')}>Search Blog</h3>
                        <div className={cx('search-box')}>
                            <input type="text" placeholder="Search..." />
                            <button>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>

                    {/* 📂 Categories */}
                    <div className={cx('sidebar-widget')}>
                        <h3 className={cx('sidebar-title')}>Categories</h3>
                        <ul className={cx('categories')}>
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <Link to={`/blog/category/${cat.slug}`}>{cat.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 🔖 Popular Tags */}
                    <div className={cx('sidebar-widget')}>
                        <h3 className={cx('sidebar-title')}>Popular Tags</h3>
                        <div className={cx('tags')}>
                            {tags.map((tag) => (
                                <Link key={tag._id} to={`/blog/tag/${tag.slug}`} className={cx('tag')}>
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ⭐ Bài viết nổi bật */}
                    <div className={cx('sidebar-widget')}>
                        <h3 className={cx('sidebar-title')}>Bài viết nổi bật</h3>
                        <ul className={cx('featured-posts')}>
                            {featuredPosts.map((p) => (
                                <li key={p._id}>
                                    <Link to={`/blog/${p._id}`}>
                                        <img src={p.image || '/default-thumbnail.jpg'} alt={p.title} />
                                        <p>{p.title}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PostDetailPage;
