import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './OrderTrash.module.scss';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const OrderTrash = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeletedOrders = async () => {
            try {
                const res = await axiosClient.get('/orders/trash'); // ✅ dùng axiosClient
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error('Lỗi khi tải đơn đã xóa:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeletedOrders();
    }, []);

    const handleRestore = async (orderId) => {
        if (!window.confirm('Khôi phục đơn hàng này?')) return;
        try {
            await axiosClient.patch(`/orders/${orderId}/restore`); // dùng endpoint restore
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            alert('Đơn đã được khôi phục!');
        } catch (err) {
            console.error('Lỗi khi khôi phục:', err);
            alert('Không thể khôi phục đơn!');
        }
    };

    const handleForceDelete = async (orderId) => {
        if (!window.confirm('Xóa vĩnh viễn đơn hàng này?')) return;
        try {
            await axiosClient.delete(`/orders/${orderId}/force`);
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            alert('Đơn hàng đã bị xóa vĩnh viễn!');
        } catch (err) {
            console.error('Lỗi khi xóa vĩnh viễn:', err);
            alert('Không thể xóa đơn hàng!');
        }
    };

    return (
        <div className={cx('orders-page')}>
            <h1 className={cx('title')}>🗑 Thùng rác đơn hàng</h1>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className={cx('orders-table')}>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-6)}</td>
                                    <td>{order.shippingInfo?.name || 'Ẩn danh'}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>{order.totalAmount.toLocaleString('vi-VN')} ₫</td>

                                    <td className={cx('actions')}>
                                        <button
                                            onClick={() => handleRestore(order._id)}
                                            className={cx('action-btn', 'restore')}
                                        >
                                            <RotateCcw size={18} /> Khôi phục
                                        </button>
                                        <button
                                            onClick={() => handleForceDelete(order._id)}
                                            className={cx('action-btn', 'delete')}
                                        >
                                            <Trash2 size={18} /> Xóa vĩnh viễn
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={cx('no-orders')}>
                                    Không có đơn nào trong thùng rác
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderTrash;
