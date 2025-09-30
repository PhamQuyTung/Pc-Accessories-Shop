// src/pages/Admin/OrderStats.js
import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    LineChart,
    Line,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { FaShoppingCart, FaCheckCircle, FaTimesCircle, FaClock, FaTruck } from 'react-icons/fa';
import axiosClient from '~/utils/axiosClient';
import styles from './OrderStats.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545']; // xanh, xanh lá, vàng, đỏ

function OrderStats() {
    const [orders, setOrders] = useState([]);
    const [statusStats, setStatusStats] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueStats, setRevenueStats] = useState([]);
    // const [productLimit, setProductLimit] = useState(10);

    // 🔥 Fetch dữ liệu
    const fetchOrders = async () => {
        try {
            const res = await axiosClient.get('/orders/all');
            const data = res.data?.orders || [];
            console.log('Orders:', data);

            setOrders(data);

            // Thống kê theo trạng thái
            const statusCount = {};
            data.forEach((o) => {
                statusCount[o.status] = (statusCount[o.status] || 0) + 1;
            });
            setStatusStats(
                Object.keys(statusCount).map((key) => ({
                    name: key,
                    value: statusCount[key],
                })),
            );

            // Thống kê doanh thu theo ngày
            const revenueMap = {};
            data.filter((o) => o.status === 'completed').forEach((o) => {
                const date = new Date(o.createdAt).toLocaleDateString('vi-VN');
                revenueMap[date] = (revenueMap[date] || 0) + (o.finalAmount || 0);
            });
            setRevenueStats(Object.entries(revenueMap).map(([date, total]) => ({ date, total })));

            // Top khách hàng (dựa trên tổng tiền completed)
            const customerMap = {};
            data.filter((o) => o.status === 'completed').forEach((o) => {
                const name = o.shippingInfo?.name || 'Khách lạ';
                customerMap[name] = (customerMap[name] || 0) + (o.finalAmount || 0);
            });
            setTopCustomers(
                Object.entries(customerMap)
                    .map(([name, total]) => ({ name, total }))
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5),
            );

            // Top sản phẩm bán chạy
            const productMap = {};
            data.filter((o) => o.status === 'completed').forEach((o) => {
                (o.items || []).forEach((item) => {
                    const productName = item.productName || item.product_id?.name || 'Sản phẩm không rõ';

                    productMap[productName] = (productMap[productName] || 0) + (item.quantity || 0);
                });
            });
            setTopProducts(
                Object.entries(productMap)
                    .map(([name, qty]) => ({ name, qty }))
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 5), // giới hạn số sản phẩm hiển thị
            );
        } catch (err) {
            console.error('Fetch order stats failed:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []); // Chỉ chạy một lần khi component mount

    return (
        <div className={cx('wrapper')}>
            <h2>📊 Thống kê đơn hàng chi tiết</h2>

            {/* Status Pie Chart */}
            <div className={cx('charts-grid')}>
                {/* Row 1: Pie + Line */}
                <div className={cx('charts-row')}>
                    <div className={cx('chart')}>
                        <h3>🛒 Tỉ lệ trạng thái đơn hàng</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusStats}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {statusStats.map((_, i) => (
                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={cx('chart')}>
                        <h3>💰 Doanh thu theo ngày</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#28a745" name="Doanh thu (₫)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers */}
                <div className={cx('chart')}>
                    <h3>👤 Top khách hàng (theo doanh thu)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCustomers} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} /> {/* tăng width cho tên */}
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#17a2b8" name="Tổng chi tiêu (₫)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className={cx('chart')}>
                    <h3>📦 Sản phẩm bán chạy</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                tickFormatter={(name) => (name.length > 10 ? name.slice(0, 10) + '...' : name)}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="qty" fill="#ffc107" name="Số lượng bán" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className={cx('recent-orders')}>
                <h3>📝 Danh sách đơn hàng gần đây</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Trạng thái</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 10).map((o) => (
                            <tr key={o._id}>
                                <td>{o._id}</td>

                                <td>{o.shippingInfo?.name || 'N/A'}</td>

                                <td className={cx('status', o.status)}>
                                    {o.status === 'pending' && <FaClock />}
                                    {o.status === 'processing' && <FaTruck />}
                                    {o.status === 'completed' && <FaCheckCircle />}
                                    {o.status === 'cancelled' && <FaTimesCircle />}
                                    <span>{o.status}</span>
                                </td>

                                <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>

                                <td>{(o.finalAmount || 0).toLocaleString('vi-VN')} ₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrderStats;
