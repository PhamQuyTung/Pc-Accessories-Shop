import React, { useEffect, useState } from 'react';
import styles from './OrdersPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import OrderCard from '~/components/OrderCard/OrderCard';

const cx = classNames.bind(styles);

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const showToast = useToast();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosClient.get('/orders');
                setOrders(res.data);
            } catch (err) {
                console.error('Lỗi lấy đơn hàng:', err);
                showToast('Không thể lấy danh sách đơn hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [showToast]);

    if (loading) return <div className={cx('loading')}>Đang tải đơn hàng...</div>;
    if (orders.length === 0) return <div className={cx('no-orders')}>Bạn chưa có đơn hàng nào.</div>;

    return (
        <div className={cx('orders-page')}>
            <h2>Đơn hàng của tôi</h2>
            {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
            ))}
        </div>
    );
}

export default OrdersPage;
