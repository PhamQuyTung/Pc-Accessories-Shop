import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Breadcrumb.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Breadcrumb = () => {
    const { slug } = useParams();
    const [breadcrumbData, setBreadcrumbData] = useState([]);

    useEffect(() => {
        const fetchBreadcrumb = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/breadcrumb/${slug}`);
                setBreadcrumbData(res.data);
            } catch (err) {
                console.error('Lỗi khi lấy breadcrumb:', err);
            }
        };

        fetchBreadcrumb();
    }, [slug]);

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
