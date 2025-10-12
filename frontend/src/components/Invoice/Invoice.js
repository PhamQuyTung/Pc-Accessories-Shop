import React, { forwardRef, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Invoice.module.scss';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const Invoice = forwardRef(({ order, orderStages, currentStageIndex }, ref) => {
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const res = await axiosClient.get('/gifts');
                setGifts(res.data || []);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách quà tặng trong Invoice:', err);
            }
        };
        fetchGifts();
    }, []);

    // 👉 Tổng số lượng sản phẩm chính trong đơn hàng
    const totalMainItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div ref={ref} className={cx('invoice')}>
            {/* Header */}
            <div className={cx('header')}>
                <div className={cx('logo')}>TECHVN</div>
                <div>
                    <h1>Chi tiết đơn hàng #{order._id.slice(-6)}</h1>
                    <span className={cx('status', order.status)}>{order.status}</span>
                </div>
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
                    <p>
                        <strong>Thanh toán:</strong> {order.paymentMethod || 'Chưa có'}
                    </p>
                </div>

                <div className={cx('box')}>
                    <h3>Thông tin đặt hàng</h3>
                    <p>
                        <strong>Họ tên:</strong> {order.shippingInfo?.name}
                    </p>
                    <p>
                        <strong>SĐT:</strong> {order.shippingInfo?.phone}
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong> {order.shippingInfo?.address}
                    </p>
                    <p>
                        <strong>Mã đơn hàng:</strong> {order._id}
                    </p>
                    <p>
                        <strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p>
                        <strong>Thanh toán:</strong> {order.paymentMethod || 'Chưa có'}
                    </p>
                    <p>
                        <strong>Ghi chú:</strong> {order.note || '—'}
                    </p>
                </div>
            </div>

            {/* Tiến trình đơn hàng */}
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
                            const imageUrl = product?.images?.[0] || '/no-image.png';
                            return (
                                <tr key={item._id}>
                                    <td className={cx('product-cell')}>
                                        <img
                                            src={imageUrl}
                                            alt={product?.name || item.productName}
                                            className={cx('product-img')}
                                        />
                                        <span>{product?.name || item.productName}</span>
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

                {/* Quà tặng */}
                {gifts.length > 0 && (
                    <div className={cx('gifts')}>
                        <h3>🎁 Quà tặng kèm</h3>
                        {gifts.map((gift) => (
                            <div key={gift._id} className={cx('gift-item')}>
                                <h4>{gift.title}</h4>
                                <table className={cx('gift-table')}>
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th className={cx('text-center')}>Số lượng</th>
                                            <th className={cx('text-right')}>Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gift.products.map((p) => {
                                            const prod = p.productId;
                                            const img = prod?.images?.[0] || '/no-image.png';
                                            return (
                                                <tr key={p.productId?._id || p.productName}>
                                                    <td className={cx('product-cell')}>
                                                        <img
                                                            src={img}
                                                            alt={prod?.name || p.productName}
                                                            className={cx('product-img')}
                                                        />
                                                        <span>{prod?.name || p.productName}</span>
                                                    </td>
                                                    <td className={cx('text-center')}>{p.quantity * totalMainItems}</td>
                                                    <td className={cx('text-right')}>
                                                        {p.finalPrice
                                                            ? `${p.finalPrice.toLocaleString('vi-VN')} ₫`
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
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
                    <span>Tổng cộng:</span>{' '}
                    <strong>
                        {(
                            order.subtotal +
                            order.tax +
                            order.serviceFee +
                            order.shippingFee -
                            order.discount
                        ).toLocaleString('vi-VN')}{' '}
                        ₫
                    </strong>
                </p>
            </div>

            {/* Chữ ký */}
            <div className={cx('footer')}>
                <div className={cx('signature')}>
                    <p>
                        <strong>Người lập hóa đơn</strong>
                    </p>
                    <div className={cx('signature-img')}>
                        <img src="/uploads/signature/signature-tung.png" alt="Chữ ký người lập" />
                    </div>
                </div>

                <div className={cx('signature')}>
                    <p>
                        <strong>Người nhận hàng</strong>
                    </p>
                </div>
            </div>
        </div>
    );
});

export default Invoice;
