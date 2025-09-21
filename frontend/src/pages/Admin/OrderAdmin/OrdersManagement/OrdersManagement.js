import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './OrdersManagement.module.scss';
import axios from 'axios';

const cx = classNames.bind(styles);

const tabList = [
    { key: 'all', label: 'Tất cả' },
    { key: 'new', label: 'Mới' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
];

const OrdersManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders/all', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error('Lỗi khi tải đơn hàng:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

    return (
        <div className={cx('orders-page')}>
            <h1 className={cx('title')}>Quản lý đơn hàng</h1>

            {/* Tabs */}
            <div className={cx('tabs')}>
                {tabList.map((tab) => (
                    <button
                        key={tab.key}
                        className={cx('tab-btn', { active: activeTab === tab.key })}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bảng danh sách đơn */}
            <div className={cx('table-wrapper')}>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <table className={cx('orders-table')}>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Trạng thái</th>
                                <th className={cx('text-right')}>Tổng tiền</th>
                                <th className={cx('text-center')}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>#{order._id.slice(-6)}</td>
                                        <td>{order.shippingInfo?.name || 'Ẩn danh'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={cx('status', order.status)}>{order.status}</span>
                                        </td>
                                        <td className={cx('text-right')}>
                                            {order.finalAmount.toLocaleString('vi-VN')} ₫
                                        </td>
                                        <td className={cx('actions')}>
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className={cx('action-btn', 'view')}
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button className={cx('action-btn', 'edit')}>
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => alert(`Xóa đơn ${order._id}`)}
                                                className={cx('action-btn', 'delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={cx('no-orders')}>
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;
