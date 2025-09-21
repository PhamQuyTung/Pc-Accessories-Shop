import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderDetail.module.scss';
import axios from 'axios';

const cx = classNames.bind(styles);

const orderStages = [
    'Tiếp nhận đơn hàng',
    'Xác nhận đơn hàng',
    'Chuẩn bị hàng hóa',
    'Đóng gói',
    'Vận chuyển và giao hàng',
    'Xử lý thanh toán',
    'Xử lý đổi trả (nếu có)',
];

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setOrder(res.data.order);
            } catch (err) {
                console.error('Lỗi khi lấy đơn hàng:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <p>Đang tải...</p>;
    if (!order) return <p>Không tìm thấy đơn hàng</p>;

    let currentStageIndex = 0;
    if (order.status === 'new') currentStageIndex = 1;
    if (order.status === 'processing') currentStageIndex = 3;
    if (order.status === 'shipping') currentStageIndex = 4;
    if (order.status === 'completed') currentStageIndex = 6;
    if (order.status === 'cancelled') currentStageIndex = 1;

    return (
        <div className={cx('order-detail')}>
            <div className={cx('header')}>
                <h1>Chi tiết đơn hàng #{order._id.slice(-6)}</h1>
                <span className={cx('status', order.status)}>{order.status}</span>
            </div>
            <p className={cx('date')}>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>

            {/* Thông tin khách hàng */}
            <div className={cx('info-section')}>
                <div className={cx('box')}>
                    <h3>Thông tin thanh toán</h3>
                    <p>
                        <strong>Họ tên:</strong> {order.shippingInfo?.name}
                    </p>
                    <p>
                        <strong>SĐT:</strong> {order.shippingInfo?.phone}
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong> {order.shippingInfo?.address}
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className={cx('timeline')}>
                <h3>Hoạt động đơn hàng</h3>
                <ul>
                    {orderStages.map((stage, index) => (
                        <li
                            key={index}
                            className={cx('timeline-item', {
                                done: index < currentStageIndex,
                                current: index === currentStageIndex,
                                pending: index > currentStageIndex,
                            })}
                        >
                            <span className={cx('step')}>{index + 1}</span>
                            <span className={cx('text')}>{stage}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sản phẩm */}
            <div className={cx('products')}>
                <h3>Sản phẩm</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th className={cx('text-center')}>Số lượng</th>
                            <th className={cx('text-right')}>Đơn giá</th>
                            <th className={cx('text-right')}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => {
                            const product = item.product_id;
                            const imageUrl = product?.images?.length > 0 ? product.images[0] : '/no-image.png'; // ảnh fallback nếu không có
                            return (
                                <tr key={item._id}>
                                    <td className={cx('product-cell')}>
                                        <img src={imageUrl} alt={product?.name} className={cx('product-img')} />
                                        <Link to={`/products/${product.slug}`}>{product?.name}</Link>
                                    </td>
                                    <td className={cx('text-center')}>{item.quantity}</td>
                                    <td className={cx('text-right')}>{item.price.toLocaleString('vi-VN')} ₫</td>
                                    <td className={cx('text-right')}>
                                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Tổng cộng */}
            <div className={cx('totals')}>
                <p>
                    <span>Tạm tính:</span> <strong>{order.subtotal.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p>
                    <span>Thuế (VAT):</span> <strong>{order.tax.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p>
                    <span>Phí dịch vụ:</span> <strong>{order.serviceFee.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p>
                    <span>Phí vận chuyển:</span> <strong>{order.shippingFee.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p>
                    <span>Giảm giá:</span> <strong>{order.discount.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p className={cx('grand-total')}>
                    <span>Tổng cộng:</span> <strong>{order.finalAmount.toLocaleString('vi-VN')} ₫</strong>
                </p>
            </div>

            {/* Action buttons */}
            <div className={cx('actions')}>
                <button className={cx('btn', 'update')}>Cập nhật trạng thái</button>
                <button className={cx('btn', 'print')}>In hóa đơn</button>
                <button className={cx('btn', 'delete')}>Xóa đơn hàng</button>
                <Link to="/admin/orders" className={cx('btn', 'back')}>
                    ← Quay lại
                </Link>
            </div>
        </div>
    );
};

export default OrderDetail;
