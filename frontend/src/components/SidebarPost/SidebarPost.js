import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './SidebarPost.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const SidebarPost = () => {
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, tagRes, featRes] = await Promise.all([
                    axiosClient.get('/post-categories/with-count'),
                    axiosClient.get('/post-tags'),
                    axiosClient.get('/posts/featured'),
                ]);
                setCategories(catRes.data);
                setTags(tagRes.data);
                setFeaturedPosts(featRes.data);
            } catch (err) {
                console.error('❌ Lỗi tải sidebar data:', err);
            }
        };

        fetchData();
    }, []);

    return (
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
                            <Link to={`/blog/category/${cat.slug}`}>
                                {cat.name} 
                            </Link>
                            <span>({cat.total || 0})</span>
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
    );
};

export default SidebarPost;
