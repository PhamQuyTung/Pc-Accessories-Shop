// src/pages/BlogPage/BlogPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './BlogPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const BlogPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axiosClient.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error('❌ Lỗi tải posts:', err);
        }
    };

    return (
        <div className={cx('blog-page')}>
            <h1 className={cx('page-title')}>Tin tức công nghệ</h1>
            <div className={cx('posts-grid')}>
                {posts.map((post) => (
                    <div key={post._id} className={cx('post-card')}>
                        <div className={cx('thumbnail')}>
                            <img src={post.image || '/default-thumbnail.jpg'} alt={post.title} />
                        </div>
                        <div className={cx('post-content')}>
                            <Link to={`/blog/${post._id}`}>
                                <h2 className={cx('post-title')}>{post.title}</h2>
                            </Link>
                            <p className={cx('excerpt')}>
                                {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                            </p>
                            <Link to={`/blog/${post._id}`} className={cx('read-more')}>
                                Xem chi tiết →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
