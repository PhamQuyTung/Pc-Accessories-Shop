import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styles from './OrdersPage.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import OrderCard from '~/components/OrderCard/OrderCard';
import Swal from 'sweetalert2';
import cartEvent from '~/utils/cartEvent'; // ✅ nhớ import

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

    const fetchOrders = useCallback(async () => {
        try {
            const res = await axiosClient.get('/orders');
            const data = res.data;

            // Nếu data không phải mảng, fallback về []
            if (Array.isArray(data)) {
                setOrders(data);
            } else if (Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders([]);
                console.error('Dữ liệu trả về không hợp lệ:', data);
            }
        } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
            showToast('Không thể lấy danh sách đơn hàng', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Mua lại: thêm items vào giỏ rồi soft-delete order (chuyển vào thùng rác)
    const handleReorder = async (order) => {
        const confirm = await Swal.fire({
            icon: 'question',
            title: 'Mua lại đơn này?',
            text: 'Các sản phẩm sẽ được thêm vào giỏ và đơn sẽ chuyển vào thùng rác.',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoading(true);

            // chuẩn hóa payload items
            const itemsPayload = (order.items || []).map((it) => ({
                product_id: it.product_id?._id || it.product_id,
                quantity: it.quantity,
            }));

            // 1) Thêm vào giỏ
            await axiosClient.post('/carts/bulk-add', { items: itemsPayload });

            // ✅ Phát sự kiện cập nhật count ngay lập tức
            cartEvent.emit('update-cart-count');

            // 2) Soft delete order
            const res = await axiosClient.delete(`/orders/${order._id}`);

            // 🔎 Kiểm tra backend trả về
            if (res.data?.order?.status !== 'deleted') {
                throw new Error('Order chưa chuyển sang trạng thái deleted!');
            }

            // 3) Cập nhật state: bỏ đơn đó khỏi danh sách hiện tại
            setOrders((prev) => prev.filter((o) => o._id !== order._id));

            showToast('Đã thêm sản phẩm vào giỏ hàng và chuyển đơn vào thùng rác', 'success');
        } catch (err) {
            console.error('Lỗi mua lại:', err);
            showToast('Không thể mua lại đơn. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchOrders trong useEffect khi mount
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const checkForWithdrawnProducts = async () => {
            if (!orders.length) return;

            for (const order of orders) {
                for (const item of order.items) {
                    const product = item.product_id;

                    // Nếu sản phẩm bị thu hồi (đã xóa, ẩn hoặc null)
                    if (!product || product.deleted || product.status === false) {
                        await Swal.fire({
                            icon: 'warning',
                            title: `Sản phẩm "${product?.name || 'không xác định'}" đã bị thu hồi`,
                            text: 'Do sự cố không mong muốn, sản phẩm này sẽ bị thu hồi và hoàn lại tiền cho quý khách.',
                            confirmButtonText: 'Tôi đã hiểu',
                        });

                        // TODO: Gọi API cập nhật đơn hàng hoặc thêm logic tiếp theo tùy trạng thái thanh toán
                    }
                }
            }
        };

        checkForWithdrawnProducts();
    }, [orders]);

    // Lọc đơn theo tab và search
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (search.trim()) {
            // Nếu có search, chỉ lọc theo mã đơn hàng, KHÔNG lọc theo tab
            filtered = filtered.filter((o) => String(o._id).toLowerCase().includes(search.trim().toLowerCase()));
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
                                active: search.trim()
                                    ? tab.key === 'all' // Khi search, chỉ tab "Tất cả" active
                                    : activeTab === tab.key, // Khi không search, tab nào chọn thì active
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
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className={cx('orders-list')}>
                {filteredOrders.length === 0 ? (
                    <div className={cx('no-orders')}>Không tìm thấy đơn hàng phù hợp.</div>
                ) : (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onCancel={() => fetchOrders()}
                            onReorder={handleReorder}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default OrdersPage;
