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
import styles from './AdminStats.module.scss';
import classNames from 'classnames/bind';

import axiosClient from '~/utils/axiosClient';
import Counter from '~/components/Counter/Counter';

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orderRes, userRes, productStatsRes, postStatsRes] = await Promise.all([
                    axiosClient.get('/orders'),
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

                const monthly = {};
                ordersData.forEach((o) => {
                    const d = new Date(o.createdAt);
                    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
                    monthly[key] = (monthly[key] || 0) + 1;
                });
                const chartArr = Object.keys(monthly).map((key) => ({
                    month: key,
                    orders: monthly[key],
                }));

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
                setChartData(chartArr);
            } catch (err) {
                console.error('Fetch stats failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
            <h2>Thống kê Admin</h2>

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

            {/* Chart */}
            {!loading && (
                <div className={cx('chart')}>
                    <h3>Đơn hàng theo tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis dataKey="month" stroke="#333" />
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
                            />
                        </LineChart>
                    </ResponsiveContainer>
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
