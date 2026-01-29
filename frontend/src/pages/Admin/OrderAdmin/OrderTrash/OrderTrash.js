import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './OrderTrash.module.scss';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const OrderTrash = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ✅ Track đang xử lý action nào

    useEffect(() => {
        fetchDeletedOrders();
    }, []);

    const fetchDeletedOrders = async () => {
        try {
            setLoading(true);
            // ✅ FIX: Dùng đúng endpoint
            const res = await axiosClient.get('/orders/trash');
            console.log('📋 Deleted orders:', res.data.orders);
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error('❌ Lỗi khi tải đơn đã xóa:', err);
            alert('Không thể tải thùng rác!');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (orderId) => {
        if (!window.confirm('Khôi phục đơn hàng này?')) return;
        
        setActionLoading(orderId);
        try {
            console.log('🔄 Restoring order:', orderId);
            // ✅ FIX: Dùng PATCH thay vì GET/DELETE
            const res = await axiosClient.patch(`/orders/${orderId}/restore`);
            console.log('✅ Restore success:', res.data);
            
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            alert('✅ Đơn đã được khôi phục!');
        } catch (err) {
            console.error('❌ Lỗi khi khôi phục:', err);
            alert(err.response?.data?.message || 'Không thể khôi phục đơn!');
        } finally {
            setActionLoading(null);
        }
    };

    const handleForceDelete = async (orderId) => {
        if (!window.confirm('Xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác!')) return;
        
        setActionLoading(orderId);
        try {
            console.log('🗑 Force deleting order:', orderId);
            // ✅ FIX: Dùng DELETE
            const res = await axiosClient.delete(`/orders/${orderId}/force`);
            console.log('✅ Force delete success:', res.data);
            
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            alert('✅ Đơn hàng đã bị xóa vĩnh viễn!');
        } catch (err) {
            console.error('❌ Lỗi khi xóa vĩnh viễn:', err);
            alert(err.response?.data?.message || 'Không thể xóa đơn hàng!');
        } finally {
            setActionLoading(null);
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
                                    <td>{order.totalAmount?.toLocaleString('vi-VN') || '0'} ₫</td>

                                    <td className={cx('actions')}>
                                        <button
                                            onClick={() => handleRestore(order._id)}
                                            disabled={actionLoading === order._id}
                                            className={cx('action-btn', 'restore')}
                                        >
                                            <RotateCcw size={18} /> 
                                            {actionLoading === order._id ? 'Đang xử lý...' : 'Khôi phục'}
                                        </button>
                                        <button
                                            onClick={() => handleForceDelete(order._id)}
                                            disabled={actionLoading === order._id}
                                            className={cx('action-btn', 'delete')}
                                        >
                                            <Trash2 size={18} /> 
                                            {actionLoading === order._id ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
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
