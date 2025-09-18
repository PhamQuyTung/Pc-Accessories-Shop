// src/pages/BlogPage/BlogPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './BlogPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { Link } from 'react-router-dom';
import getExcerpt from '~/utils/getExcerpt';
import SidebarPost from '~/components/SidebarPost/SidebarPost';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';

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
            {/* 👇 Thêm breadcrumb */}
            <Breadcrumb
                type="custom"
                customData={[
                    { path: '/', label: 'Trang chủ' },
                    { path: '/blog', label: 'Blog' },
                ]}
            />

            <h1 className={cx('page-title')}>Tin tức công nghệ</h1>
            <div className={cx('layout')}>
                <div className={cx('main-content')}>
                    {posts.length > 0 && (
                        <>
                            {/* Bài viết nổi bật */}
                            <div className={cx('featured-post')}>
                                <img src={posts[0].image} alt={posts[0].title} />
                                <div className={cx('featured-content')}>
                                    <Link to={`/blog/category/${posts[0].category.slug}/${posts[0].slug}`}>
                                        <h2>{posts[0].title}</h2>
                                    </Link>
                                    <p>{getExcerpt(posts[0].content, 200)}</p>
                                </div>
                            </div>

                            {/* Grid các bài viết còn lại */}
                            <div className={cx('posts-grid')}>
                                {posts.slice(1).map((post) => (
                                    <div key={post._id} className={cx('post-card')}>
                                        <div className={cx('thumbnail')}>
                                            <img src={post.image || '/default-thumbnail.jpg'} alt={post.title} />
                                        </div>
                                        <div className={cx('post-content')}>
                                            <Link to={`/blog/category/${post.category.slug}/${post.slug}`}>
                                                <h3 className={cx('post-title')}>{post.title}</h3>
                                            </Link>
                                            <p className={cx('excerpt')}>{getExcerpt(post.content, 120)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <SidebarPost />
            </div>
        </div>
    );
};

export default BlogPage;
