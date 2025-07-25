import React, { useEffect, useState, useMemo } from 'react';
import styles from './OrdersPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import OrderCard from '~/components/OrderCard/OrderCard';
import Swal from 'sweetalert2';

const cx = classNames.bind(styles);

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'new', label: 'Mới' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Hủy' },
];

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new');
    const [search, setSearch] = useState('');
    
    const showToast = useToast();

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

    // Gọi fetchOrders trong useEffect khi mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Lọc đơn theo tab và search
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (search.trim()) {
            // Nếu có search, chỉ lọc theo mã đơn hàng, KHÔNG lọc theo tab
            filtered = filtered.filter((o) =>
                String(o._id).toLowerCase().includes(search.trim().toLowerCase())
            );
        } else if (activeTab !== 'all') {
            // Nếu không search, lọc theo tab như bình thường
            filtered = filtered.filter((o) => o.status === activeTab);
        }

        return filtered;
    }, [orders, activeTab, search]);

    if (loading) return <div className={cx('loading')}>Đang tải đơn hàng...</div>;
    if (orders.length === 0) return <div className={cx('no-orders')}>Bạn chưa có đơn hàng nào.</div>;

    return (
        <div className={cx('orders-page')}>
            <div className={cx('orders-header')}>
                <div className={cx('tabs')}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={cx('tab', {
                                active:
                                    search.trim()
                                        ? tab.key === 'all' // Khi search, chỉ tab "Tất cả" active
                                        : activeTab === tab.key // Khi không search, tab nào chọn thì active
                            })}
                            onClick={() => setActiveTab(tab.key)}
                            disabled={!!search.trim()} // Có thể disable chuyển tab khi đang search (tùy UX)
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <input
                    className={cx('search')}
                    type="text"
                    placeholder="Tìm theo mã đơn hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className={cx('orders-list')}>
                {filteredOrders.length === 0 ? (
                    <div className={cx('no-orders')}>Không tìm thấy đơn hàng phù hợp.</div>
                ) : (
                    filteredOrders.map((order) => (
                        <OrderCard key={order._id} order={order} onCancel={fetchOrders} />
                    ))
                )}
            </div>
        </div>
    );
}

export default OrdersPage;
