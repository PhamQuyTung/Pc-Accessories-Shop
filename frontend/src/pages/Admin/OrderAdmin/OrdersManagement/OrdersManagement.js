import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Filter } from 'lucide-react';
import classNames from 'classnames/bind';
import styles from './OrdersManagement.module.scss';
import axios from 'axios';
import Pagination from '~/components/Pagination/Pagination';
import { useToast } from '~/components/ToastMessager/ToastMessager';

const cx = classNames.bind(styles);

const tabList = [
    { key: 'all', label: 'Tất cả' },
    { key: 'new', label: 'Mới' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
];

const initialFilters = {
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    status: 'all',
};

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState(initialFilters);
    const [showFilter, setShowFilter] = useState(false);

    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(5);

    const showToast = useToast();

    // Tải dữ liệu
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/orders/all', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    params: {
                        page: currentPage,
                        limit,
                        sortField,
                        sortOrder,
                        ...filters,
                        status: filters.status === 'all' ? '' : filters.status,
                    },
                });

                setOrders(res.data.orders || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error('Lỗi khi tải đơn hàng:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage, sortField, sortOrder, filters, limit]);

    // 🔹 Hàm reset bộ lọc
    const handleResetFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1); // reset về trang 1
        showToast('Đã xóa bộ lọc!', 'success'); // ✅ Toast báo
    };

    // Xử lý xóa đơn hàng
    const handleDelete = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
        try {
            await axios.delete(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            showToast("Xóa đơn hàng thành công!", "success");
        } catch (err) {
            console.error('Lỗi khi xóa đơn hàng:', err);
            showToast("Xóa đơn hàng thất bại!", "error"); 
        }
    };

    return (
        <div className={cx('orders-page')}>
            {/* Header */}
            <div className={cx('header')}>
                <h1 className={cx('title')}>Quản lý đơn hàng</h1>
                <Link to="/admin/orders/create" className={cx('btn', 'create')}>
                    ➕ Tạo đơn hàng
                </Link>
            </div>

            {/* Tabs */}
            <div className={cx('tabs')}>
                {tabList.map((tab) => (
                    <button
                        key={tab.key}
                        className={cx('tab-btn', { active: filters.status === tab.key })}
                        onClick={() => setFilters({ ...filters, status: tab.key })}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Thanh tìm kiếm & lọc */}
            <div className={cx('filters')}>
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã đơn..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <span>đến</span>
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />

                <button type="button" className={cx('btn', 'filter-toggle')} onClick={() => setShowFilter(!showFilter)}>
                    <Filter size={16} />
                    {showFilter ? 'Ẩn lọc' : 'Lọc nâng cao'}
                </button>

                {/* ✅ Nút Xóa bộ lọc */}
                <button type="button" className={cx('btn', 'reset')} onClick={handleResetFilters}>
                    ❌ Xóa bộ lọc
                </button>
            </div>

            {/* Panel lọc nâng cao */}
            {showFilter && (
                <div className={cx('advanced-filters')}>
                    <label>
                        Từ số tiền:
                        <input
                            type="number"
                            value={filters.minAmount}
                            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                        />
                    </label>
                    <label>
                        Đến số tiền:
                        <input
                            type="number"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                        />
                    </label>
                    <label>
                        Phương thức thanh toán:
                        <select
                            value={filters.paymentMethod}
                            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                        >
                            <option value="">-- Tất cả --</option>
                            <option value="cod">COD</option>
                            <option value="bank">Chuyển khoản</option>
                        </select>
                    </label>
                </div>
            )}

            {/* Thanh sắp xếp */}
            <div className={cx('sort-bar')}>
                <label>Sắp xếp theo:</label>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                    <option value="createdAt">Ngày đặt</option>
                    <option value="orderId">Mã đơn</option>
                    <option value="name">Tên khách hàng</option>
                    <option value="finalAmount">Giá tiền</option>
                </select>
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={cx('sort-order')}>
                    {sortOrder === 'asc' ? '⬆ Tăng dần' : '⬇ Giảm dần'}
                </button>
            </div>

            {/* Bảng danh sách đơn */}
            <div className={cx('table-wrapper')}>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <>
                        <table className={cx('orders-table')}>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Trạng thái</th>
                                    <th>Thanh toán</th>
                                    <th className={cx('text-right')}>Tổng tiền</th>
                                    <th className={cx('text-center')}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{order.shippingInfo?.name || 'Ẩn danh'}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <span className={cx('status', order.status)}>{order.status}</span>
                                            </td>
                                            <td>{order.paymentMethod || '---'}</td>
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
                                                    onClick={() => handleDelete(order._id)}
                                                    className={cx('action-btn', 'delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={cx('no-orders')}>
                                            Không có đơn hàng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;
