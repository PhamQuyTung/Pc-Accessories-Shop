import React, { useEffect, useState } from 'react';
import styles from './Trash.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import Swal from 'sweetalert2';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

function Trash() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/products/trash');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast('Lỗi khi lấy danh sách thùng rác!', 'error');
            setProducts([]); // Đảm bảo luôn là mảng khi lỗi
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleForceDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
        });

        if (result.isConfirmed) {
            try {
                await axiosClient.delete(`/products/force/${id}`);
                setProducts(products.filter((p) => p._id !== id));
                toast('Đã xóa vĩnh viễn sản phẩm!', 'success');
            } catch (err) {
                toast('Lỗi khi xóa vĩnh viễn sản phẩm!', 'error');
            }
        }
    };

    const handleRestore = async (id) => {
        const result = await Swal.fire({
            title: 'Khôi phục sản phẩm này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Khôi phục',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await axiosClient.patch(`/products/restore/${id}`);
                setProducts(products.filter((p) => p._id !== id));
                toast('Đã khôi phục sản phẩm!', 'success');
            } catch (err) {
                toast('Lỗi khi khôi phục sản phẩm!', 'error');
            }
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className={cx('wrapper')}>
            <h2>Thùng rác sản phẩm</h2>
            {products.length === 0 ? (
                <div>Không có sản phẩm nào trong thùng rác.</div>
            ) : (
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Giá khuyến mãi</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.price?.toLocaleString()}₫</td>
                                <td>
                                    {product.discountPrice ? product.discountPrice.toLocaleString() + '₫' : 'Không có'}
                                </td>
                                <td>
                                    <button className={cx('btn-edit')} onClick={() => handleRestore(product._id)}>
                                        Khôi phục
                                    </button>
                                    <button className={cx('btn-delete')} onClick={() => handleForceDelete(product._id)}>
                                        Xóa vĩnh viễn
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Trash;
