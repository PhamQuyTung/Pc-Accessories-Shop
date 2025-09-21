import React, { forwardRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Invoice.module.scss';

const cx = classNames.bind(styles);

const Invoice = forwardRef(({ order, orderStages, currentStageIndex }, ref) => {
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

            {/* Thông tin khách + đơn hàng */}
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
                            const imageUrl = product?.images?.length > 0 ? product.images[0] : '/no-image.png';
                            return (
                                <tr key={item._id}>
                                    <td className={cx('product-cell')}>
                                        <img src={imageUrl} alt={product?.name} className={cx('product-img')} />
                                        <span>{product?.name}</span>
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

            {/* Footer chữ ký */}
            <div className={cx('footer')}>
                <div className={cx('signature')}>
                    <p>
                        <strong>Người lập hóa đơn</strong>
                    </p>
                    {/* Chèn ảnh chữ ký */}
                    <div className={cx('signature-img')}>
                        <img src="/uploads/signature/signature-tung.png" alt="Chữ ký người lập" />
                    </div>
                    {/* <div className={cx('line')}></div> */}
                </div>

                <div className={cx('signature')}>
                    <p>
                        <strong>Người nhận hàng</strong>
                    </p>
                    {/* <div className={cx('line')}></div> */}
                </div>
            </div>
        </div>
    );
});

export default Invoice;
