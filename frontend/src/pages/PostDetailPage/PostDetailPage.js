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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost(res.data);

                // Gọi API để lấy bài viết liên quan
                fetchRelatedPosts(res.data.category, res.data._id);
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
