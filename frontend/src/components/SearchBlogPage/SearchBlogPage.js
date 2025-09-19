// src/pages/SearchBlogPage/SearchBlogPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './SearchBlogPage.module.scss';
import classNames from 'classnames/bind';

import SidebarPost from '~/components/SidebarPost/SidebarPost';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import { SearchNoResults } from '../Icons';
import LoadingSpinner from '../SpinnerLoading/SpinnerLoading';
import getExcerpt from '~/utils/getExcerpt';

const cx = classNames.bind(styles);

function SearchBlogPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/posts/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
                setLoading(false);
            } catch (error) {
                console.error('❌ Lỗi khi tìm kiếm bài viết:', error);
                navigate('/404');
            }
        };

        fetchData();
    }, [query, navigate]);

    return (
        <div className={cx('search-page')}>
            {/* Breadcrumb */}
            <Breadcrumb
                type="custom"
                customData={[
                    { path: '/', label: 'Trang chủ' },
                    { path: '/blog', label: 'Blog' },
                    { path: '#', label: `Tìm kiếm: ${query}` },
                ]}
            />

            <div className={cx('search-header')}>
                <h1 className={cx('page-title')}>Tìm kiếm Blog</h1>
                <p>
                    Kết quả cho: “<strong>{query}</strong>”
                </p>
            </div>

            <div className={cx('layout')}>
                {/* Main Content */}
                <div className={cx('main-content')}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : results.length === 0 ? (
                        <div className={cx('not-found')}>
                            <SearchNoResults />
                            <h2>Không tìm thấy bài viết nào</h2>
                            <p>Vui lòng thử từ khóa khác!</p>
                        </div>
                    ) : (
                        <div className={cx('posts-grid')}>
                            {results.map((post) => (
                                <div key={post._id} className={cx('post-card')}>
                                    <div className={cx('thumbnail')}>
                                        <Link to={`/blog/category/${post.category?.slug}/${post.slug}`}>
                                            <img src={post.image || '/default-thumbnail.jpg'} alt={post.title} />
                                        </Link>
                                    </div>
                                    <div className={cx('post-content')}>
                                        <Link to={`/blog/category/${post.category?.slug}/${post.slug}`}>
                                            <h3 className={cx('post-title')}>{post.title}</h3>
                                        </Link>
                                        <p className={cx('excerpt')}>{getExcerpt(post.content, 120)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <SidebarPost />
            </div>
        </div>
    );
}

export default SearchBlogPage;
