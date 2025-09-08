import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

const Breadcrumb = ({ categorySlug, slug: propSlug, type }) => {
    const { slug: routeSlug } = useParams();
    const location = useLocation();
    const [breadcrumbData, setBreadcrumbData] = useState([]);

    useEffect(() => {
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
                }
            } catch (err) {
                console.error('Lỗi khi lấy breadcrumb:', err);
            }
        };

        fetchBreadcrumb();
    }, [routeSlug, propSlug, categorySlug, location.pathname, type]);

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
