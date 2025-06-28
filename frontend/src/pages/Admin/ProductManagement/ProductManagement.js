import React, { useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const ProductManagement = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                setProducts(res.data);
            } catch (err) {
                console.error('Lỗi khi tải sản phẩm:', err);
            }
        };

        fetchProducts();
    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('vi-VN') + 'đ';
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className={cx('product-management')}>
            <div className={cx('header')}>
                <h2>Quản lý sản phẩm</h2>
                <button className={cx('btn-add')}>
                    <Link to="/products/create">+ Thêm sản phẩm mới</Link>
                </button>
            </div>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Giá khuyến mãi</th>
                        <th>Danh mục</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product._id}>
                            <td>{index + 1}</td>
                            <td>
                                <img
                                    src={product.images?.[0] || '/placeholder.jpg'}
                                    alt={product.name}
                                    className={cx('product-thumb')}
                                />
                            </td>
                            <td>{product.name}</td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>{formatCurrency(product.discountPrice)}</td>
                            <td>{product.category}</td>
                            <td>{product.status ? 'Hiển thị' : 'Ẩn'}</td>
                            <td>{formatDate(product.createdAt)}</td>
                            <td>
                                <button className={cx('btn-edit')}>✏️</button>
                                <button className={cx('btn-delete')}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagement;
