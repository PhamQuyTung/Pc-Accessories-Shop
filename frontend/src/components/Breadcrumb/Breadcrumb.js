import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

const Breadcrumb = ({ categorySlug, slug: propSlug, type, customData }) => {
    const { slug: routeSlug } = useParams();
    const location = useLocation();
    const [breadcrumbData, setBreadcrumbData] = useState([]);

    useEffect(() => {
        if (customData) {
            setBreadcrumbData(customData);
            return;
        }
        
        const fetchBreadcrumb = async () => {
            try {
                if (type === 'promotion') {
                    // 👉 Trang khuyến mãi
                    const res = await axiosClient.get(`/promotions/slug/${propSlug || routeSlug}`);
                    setBreadcrumbData([
                        { path: '/', label: 'Trang chủ' },
                        { path: location.pathname, label: res.data.name },
                    ]);
                } else if (type === 'category') {
                    // 👉 Trang danh mục
                    const res = await axiosClient.get(`/products/breadcrumb/category/${categorySlug || routeSlug}`);

                    // ✅ Fix path: chuyển collections -> categories
                    const fixedData = res.data.map((item) => ({
                        ...item,
                        path: item.path.replace('/collections/', '/categories/'),
                    }));

                    setBreadcrumbData(fixedData);
                } else if (location.pathname.includes('/products')) {
                    // 👉 Trang chi tiết sản phẩm
                    const res = await axiosClient.get(`/products/breadcrumb/${routeSlug}`);

                    // ✅ Fix path: chuyển collections -> categories
                    const fixedData = res.data.map((item) => ({
                        ...item,
                        path: item.path.replace('/collections/', '/categories/'),
                    }));

                    setBreadcrumbData(fixedData);
                } else if (type === 'blog-category') {
                    // 👉 Breadcrumb cho Blog Category
                    try {
                        const res = await axiosClient.get(`/post-categories/slug/${routeSlug}`);
                        const category = res.data;

                        setBreadcrumbData([
                            { path: '/', label: 'Trang chủ' },
                            { path: '/blog', label: 'Blog' },
                            { path: `/blog/category/${category.slug}`, label: category.name },
                        ]);
                    } catch (err) {
                        console.error('Lỗi khi lấy breadcrumb blog-category:', err);
                        // fallback
                        setBreadcrumbData([
                            { path: '/', label: 'Trang chủ' },
                            { path: '/blog', label: 'Blog' },
                            { path: `/blog/category/${routeSlug}`, label: routeSlug.replace(/-/g, ' ') },
                        ]);
                    }
                } else if (type === 'blog-tag') {
                    // 👉 Breadcrumb cho Blog Tag
                    try {
                        const res = await axiosClient.get(`/post-tags/slug/${routeSlug}`);
                        const tag = res.data;
                        // console.log('👉 Kết quả API blog-tag:', tag);

                        setBreadcrumbData([
                            { path: '/', label: 'Trang chủ' },
                            { path: '/blog', label: 'Blog' },
                            { path: `/blog/tag/${tag.slug}`, label: tag.name },
                        ]);
                    } catch (err) {
                        console.error('Lỗi khi lấy breadcrumb blog-tag:', err);
                        // fallback
                        setBreadcrumbData([
                            { path: '/', label: 'Trang chủ' },
                            { path: '/blog', label: 'Blog' },
                            { path: `/blog/tag/${routeSlug}`, label: routeSlug.replace(/-/g, ' ') },
                        ]);
                    }
                } else if (type === 'blog-detail') {
                    // 👉 Breadcrumb cho trang chi tiết bài viết
                    try {
                        const res = await axiosClient.get(`/posts/${categorySlug}/${propSlug || routeSlug}`);
                        const post = res.data;

                        setBreadcrumbData([
                            { path: '/', label: 'Trang chủ' },
                            { path: '/blog', label: 'Blog' },
                            {
                                path: `/blog/category/${post.category?.slug}`,
                                label: post.category?.name || 'Chưa phân loại',
                            },
                            { path: location.pathname, label: post.title },
                        ]);
                    } catch (err) {
                        console.error('Lỗi khi lấy breadcrumb blog-detail:', err);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi lấy breadcrumb:', err);
            }
        };

        fetchBreadcrumb();
    }, [routeSlug, propSlug, categorySlug, location.pathname, type, customData]);

    return (
        <nav className={cx('breadcrumb')}>
            {breadcrumbData.map((item, index) => (
                <span className={cx('breadcrumb-wrap')} key={index}>
                    {index !== breadcrumbData.length - 1 ? (
                        <>
                            <Link to={item.path}>{item.label}</Link>
                            <span className={cx('separator')}> {'>'} </span>
                        </>
                    ) : (
                        <span className={cx('current')}>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
