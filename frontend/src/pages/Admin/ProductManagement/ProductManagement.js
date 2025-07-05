import React, { useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { Link } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const toast = useToast();

    // Đưa fetchProducts ra ngoài useEffect
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error('Lỗi khi tải sản phẩm:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('vi-VN') + 'đ';
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleSoftDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa tạm thời sản phẩm này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/products/soft/${id}`);
                toast('Đã chuyển sản phẩm vào thùng rác!', 'success');
                fetchProducts();
            } catch (err) {
                toast('Lỗi khi xóa sản phẩm!', 'error');
            }
        }
    };

    return (
        <div className={cx('product-management')}>
            <div className={cx('header')}>
                <h2>
                    Quản lý sản phẩm
                    {/* Tổng tất cả sản phẩm */}
                    <span className={cx('product-count')}>({products.length})</span>
                </h2>
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
                        <th>Số lượng</th>
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
                            <td>{product.category?.name || 'Không có danh mục'}</td> {/* ✅ hiển thị tên danh mục */}
                            <td>
                                {product.status?.includes('đang nhập hàng')
                                    ? 'Đang nhập hàng'
                                    : product.quantity}
                            </td>
                            <td>{product.status ? 'Hiển thị' : 'Ẩn'}</td>
                            <td>{formatDate(product.createdAt)}</td>
                            <td>
                                <div className={cx('action-buttons')}>
                                    <Link to={`/products/edit/${product._id}`} className={cx('btn-edit-link')}>
                                        <button className={cx('btn-edit')}>✏️</button>
                                    </Link>
                                    <button className={cx('btn-delete')} onClick={() => handleSoftDelete(product._id)}>
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagement;
