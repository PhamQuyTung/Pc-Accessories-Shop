// src/pages/CategoryPage/PostListCategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PostListCategoryPage.module.scss';
import classNames from 'classnames/bind';
import getExcerpt from '~/utils/getExcerpt';
import SidebarPost from '~/components/SidebarPost/SidebarPost';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';

const cx = classNames.bind(styles);

const PostListCategoryPage = () => {
    const { slug } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [slug]);

    const fetchPosts = async () => {
        try {
            const res = await axiosClient.get(`/posts/category/${slug}`);
            setPosts(res.data.posts); // backend trả về { posts, category }
            setCategory(res.data.category); // category: { name, slug, description... }
        } catch (err) {
            console.error('❌ Lỗi khi load category posts:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className={cx('category-page')}>
            <div className={cx('breadcrumb-custom')}>
                <Breadcrumb type="blog-category" />
            </div>

            <h1 className={cx('page-title')}>
                Danh mục: <span>{category?.name || slug.replace(/-/g, ' ')}</span>
            </h1>

            <div className={cx('layout')}>
                <div className={cx('main-content')}>
                    {posts.length === 0 ? (
                        <div className={cx('no-posts')}>
                            <FontAwesomeIcon icon={faFolder} size="2x" />
                            <p>Không có bài viết nào trong danh mục này.</p>
                        </div>
                    ) : (
                        <>
                            {/* Featured Post */}
                            <div className={cx('featured-post')}>
                                <img src={posts[0].image || '/default-thumbnail.jpg'} alt={posts[0].title} />
                                <div className={cx('featured-content')}>
                                    <Link to={`/blog/category/${posts[0].category.slug}/${posts[0].slug}`}>
                                        <h2>{posts[0].title}</h2>
                                    </Link>
                                    <p>{getExcerpt(posts[0].content, 200)}</p>
                                </div>
                            </div>

                            {/* Grid posts */}
                            <div className={cx('posts-grid')}>
                                {posts.slice(1).map((post) => (
                                    <div key={post._id} className={cx('post-card')}>
                                        <div className={cx('thumbnail')}>
                                            <img src={post.image || '/default-thumbnail.jpg'} alt={post.title} />
                                        </div>
                                        <div className={cx('post-content')}>
                                            <Link to={`/blog/category/${posts[0].category.slug}/${posts[0].slug}`}>
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

export default PostListCategoryPage;
