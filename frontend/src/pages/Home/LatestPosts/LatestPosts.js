import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './LatestPosts.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const LatestPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get('/posts?limit=4'); // lấy 4 bài mới nhất
                setPosts(res.data);
            } catch (err) {
                console.error('❌ Lỗi tải bài viết:', err);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className={cx('latest-posts-container')}>
            <div className={cx('header')}>
                <h2>Tin tức công nghệ</h2>
                <Link to="/blog" className={cx('see-all')}>
                    Xem tất cả
                </Link>
            </div>

            <div className={cx('grid')}>
                {posts.map((post) => (
                    <Link to={`/blog/${post._id}`} key={post._id} className={cx('card')}>
                        <div className={cx('thumb')}>
                            <img src={post.image || '/no-image.png'} alt={post.title} />
                            <span className={cx('category')}>{post.category}</span>
                        </div>
                        <div className={cx('info')}>
                            <h3>{post.title}</h3>
                            <p>{post.content.slice(0, 80)}...</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LatestPosts;
