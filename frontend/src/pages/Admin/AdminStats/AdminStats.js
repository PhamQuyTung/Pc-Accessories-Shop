import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    FaShoppingCart,
    FaUsers,
    FaBoxOpen,
    FaEye,
    FaEyeSlash,
    FaDollarSign,
    FaNewspaper,
    FaCheckCircle,
    FaRegFileAlt,
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import styles from './AdminStats.module.scss';
import classNames from 'classnames/bind';

import axiosClient from '~/utils/axiosClient';
import Counter from '~/components/Counter/Counter';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

function AdminStats() {
    const [stats, setStats] = useState({
        orders: 0,
        users: 0,
        revenue: 0,
        products: 0,
        visibleProducts: 0,
        hiddenProducts: 0,
        posts: 0,
        publishedPosts: 0,
        draftPosts: 0,
    });
    const [orders, setOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('month'); // hour | day | month | year

    const showToast = useToast();

    // 🔥 Fetch stats
    const fetchStats = async () => {
        try {
            const [orderRes, userRes, productStatsRes, postStatsRes] = await Promise.all([
                axiosClient.get('/orders/all'),
                axiosClient.get('/accounts'),
                axiosClient.get('/products/stats'),
                axiosClient.get('/posts/stats'),
            ]);

            const ordersData = orderRes.data?.orders || [];
            const usersData = userRes.data || [];
            const productStats = productStatsRes.data;
            const postStats = postStatsRes.data;

            const revenue = ordersData
                .filter((o) => o.status === 'completed')
                .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

            setStats({
                orders: ordersData.length,
                users: usersData.length,
                revenue,
                products: productStats.total,
                visibleProducts: productStats.visible,
                hiddenProducts: productStats.hidden,
                posts: postStats.total,
                publishedPosts: postStats.published,
                draftPosts: postStats.draft,
            });

            setOrders(ordersData);
        } catch (err) {
            console.error('Fetch stats failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Fetch chart data
    const fetchChartStats = async (type) => {
        try {
            const res = await axiosClient.get('/orders/stats');
            const statsData = res.data;

            let rawData = [];
            switch (type) {
                case 'hour':
                    rawData = statsData.byHour.map((i) => ({
                        label: `${i._id.hour}:00`,
                        orders: i.orders,
                        revenue: i.revenue,
                    }));
                    break;
                case 'day':
                    rawData = statsData.byDay.map((i) => ({
                        label: `Ngày ${i._id.day}`,
                        orders: i.orders,
                        revenue: i.revenue,
                    }));
                    break;
                case 'month':
                    rawData = statsData.byMonth.map((i) => ({
                        label: `T${i._id.month}`,
                        orders: i.orders,
                        revenue: i.revenue,
                    }));
                    break;
                case 'year':
                    rawData = statsData.byYear.map((i) => ({
                        label: `${i._id.year}`,
                        orders: i.orders,
                        revenue: i.revenue,
                    }));
                    break;
                default:
                    rawData = [];
            }

            setChartData(rawData);
        } catch (err) {
            console.error('Fetch chart stats failed:', err);
        }
    };

    // socket + fetch init
    useEffect(() => {
        fetchStats();
        fetchChartStats(chartType);

        const socket = io('http://localhost:5000', { withCredentials: true });

        socket.on('order:new', (order) => {
            showToast(`📢 Có đơn hàng mới từ ${order?.shippingInfo?.name || 'khách hàng'}`, 'success');
            fetchStats();
            fetchChartStats(chartType);
        });

        socket.on('order:cancelled', (order) => {
            showToast(`⚠️ Đơn hàng ${order._id} đã bị hủy`, 'warning');
            fetchStats();
            fetchChartStats(chartType);
        });

        socket.on('order:deleted', ({ orderId }) => {
            showToast(`🗑️ Đơn hàng ${orderId} đã bị xóa`, 'error');
            fetchStats();
            fetchChartStats(chartType);
        });

        return () => socket.disconnect();
    }, [chartType, showToast]);

    const cards = [
        { title: 'Đơn hàng', value: stats.orders, icon: <FaShoppingCart />, color: 'blue' },
        { title: 'Người dùng', value: stats.users, icon: <FaUsers />, color: 'green' },
        { title: 'Sản phẩm (Tổng)', value: stats.products, icon: <FaBoxOpen />, color: 'orange' },
        { title: 'Sản phẩm (Hiển thị)', value: stats.visibleProducts, icon: <FaEye />, color: 'teal' },
        { title: 'Sản phẩm (Đang ẩn)', value: stats.hiddenProducts, icon: <FaEyeSlash />, color: 'gray' },
        { title: 'Doanh thu', value: stats.revenue, icon: <FaDollarSign />, color: 'red', isMoney: true },
        { title: 'Bài viết (Tổng)', value: stats.posts, icon: <FaNewspaper />, color: 'purple' },
        { title: 'Bài viết (Xuất bản)', value: stats.publishedPosts, icon: <FaCheckCircle />, color: 'green' },
        { title: 'Bài viết (Nháp/Ẩn)', value: stats.draftPosts, icon: <FaRegFileAlt />, color: 'gray' },
    ];

    return (
        <div className={cx('wrapper')}>
            <h2>Thống kê TECHVN</h2>

            {/* Cards */}
            <div className={cx('stats-cards')}>
                {!loading &&
                    cards.map((c, i) => (
                        <div key={i} className={cx('card', c.color)}>
                            <div className={cx('icon')}>{c.icon}</div>
                            <div className={cx('info')}>
                                <h3>{c.title}</h3>
                                <p>
                                    <Counter value={c.value} duration={1200} />
                                    {c.isMoney && '₫'}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Tabs */}
            <div className={cx('tabs')}>
                {[
                    { key: 'hour', label: 'Theo giờ', icon: '🕒' },
                    { key: 'day', label: 'Theo ngày', icon: '📅' },
                    { key: 'month', label: 'Theo tháng', icon: '📆' },
                    { key: 'year', label: 'Theo năm', icon: '📊' },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setChartType(t.key)}
                        className={cx('tab', { active: chartType === t.key })}
                    >
                        <span className={cx('icon')}>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>

            {/* Orders + Revenue charts */}
            {!loading && (
                <div className={cx('charts-grid')}>
                    <div className={cx('chart')}>
                        <h3>📦 Số đơn hàng</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis dataKey="label" stroke="#333" />
                                <YAxis stroke="#333" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#e30613"
                                    strokeWidth={3}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 8 }}
                                    name="Số đơn"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={cx('chart')}>
                        <h3>💰 Doanh thu</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis dataKey="label" stroke="#333" />
                                <YAxis stroke="#333" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#28a745"
                                    strokeWidth={3}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 8 }}
                                    name="Doanh thu"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Recent orders */}
            {!loading && (
                <div className={cx('recent-orders')}>
                    <h3>Đơn hàng gần đây</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map((o) => (
                                <tr key={o._id}>
                                    <td>{o._id}</td>
                                    <td>{o.shippingInfo?.name || 'N/A'}</td>
                                    <td>{o.status}</td>
                                    <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminStats;
