import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

const Breadcrumb = ({ categorySlug }) => {
    const { slug } = useParams();
    const location = useLocation();
    const [breadcrumbData, setBreadcrumbData] = useState([]);

    useEffect(() => {
        const fetchBreadcrumb = async () => {
            try {
                if (location.pathname.includes('/collections')) {
                    // Trang danh mục
                    const res = await axiosClient.get(`/products/breadcrumb/category/${categorySlug || slug}`);
                    setBreadcrumbData(res.data);
                } else if (location.pathname.includes('/products')) {
                    // Trang chi tiết sản phẩm
                    const res = await axiosClient.get(`/products/breadcrumb/${slug}`);
                    setBreadcrumbData(res.data);
                }
            } catch (err) {
                console.error('Lỗi khi lấy breadcrumb:', err);
            }
        };

        fetchBreadcrumb();
    }, [slug, categorySlug, location.pathname]);

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
