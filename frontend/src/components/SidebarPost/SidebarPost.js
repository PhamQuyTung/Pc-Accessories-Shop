import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    // 🔎 Search state
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

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

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await axiosClient.get(`/posts/search?q=${query}&limit=5`);
                setSuggestions(res.data);
                setShowDropdown(true);
            } catch (err) {
                console.error('❌ Lỗi search:', err);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/blog/search?q=${query}`);
            setShowDropdown(false);
        }
    };

    return (
        <aside className={cx('sidebar')}>
            {/* 🔎 Search */}
            <div className={cx('sidebar-widget')} ref={searchRef}>
                <h3 className={cx('sidebar-title')}>Search Blog</h3>
                <form className={cx('search-box')} onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query && setShowDropdown(true)}
                    />
                    <button type="submit">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </form>

                {/* Gợi ý search */}
                {showDropdown && suggestions.length > 0 && (
                    <ul className={cx('search-suggestions')}>
                        {suggestions.map((post) => (
                            <li key={post._id}>
                                <Link to={`/blog/category/${post.category.slug}/${post.slug}`}>
                                    <img src={post.image || '/default-thumbnail.jpg'} alt={post.title} />
                                    <span>{post.title}</span>
                                </Link>
                            </li>
                        ))}
                        <li className={cx('view-all')}>
                            <Link to={`/blog/search?q=${query}`}>👉 Xem tất cả kết quả</Link>
                        </li>
                    </ul>
                )}
            </div>

            {/* 📂 Categories */}
            <div className={cx('sidebar-widget')}>
                <h3 className={cx('sidebar-title')}>Categories</h3>
                <ul className={cx('categories')}>
                    {categories.map((cat) => (
                        <li key={cat._id}>
                            <Link to={`/blog/category/${cat.slug}`}>{cat.name}</Link>
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
                            <Link to={`/blog/category/${p.category.slug}/${p.slug}`}>
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
