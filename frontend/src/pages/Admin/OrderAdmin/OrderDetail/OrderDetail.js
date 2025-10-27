// OrderDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderDetail.module.scss';
import axios from 'axios';
import axiosClient from '~/utils/axiosClient';
import { useReactToPrint } from 'react-to-print';
import Invoice from '~/components/Invoice/Invoice';

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
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    // Ngay trên return hoặc ở đầu component:
    const [gifts, setGifts] = useState([]);

    // Gọi API lấy quà tặng
    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const res = await axiosClient.get('/gifts');
                setGifts(res.data || []);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách quà tặng:', err);
            }
        };
        fetchGifts();
    }, []);

    // 👉 ref cho phần in
    const printRef = useRef();

    // Hook in
    const handlePrint = useReactToPrint({
        contentRef: printRef, // 👈 dùng contentRef thay vì content()
        documentTitle: `HoaDon_${id}`,
    });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (!res.data.order) {
                    console.error('Đơn hàng không tồn tại hoặc đã bị xóa');
                    setOrder(null);
                    return;
                }

                setOrder(res.data.order);
                setNewStatus(res.data.order.status);
            } catch (err) {
                console.error('Lỗi khi lấy đơn hàng:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async () => {
        try {
            setUpdating(true);
            const res = await axios.patch(
                `/api/orders/${order._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
            );
            setOrder(res.data.order);
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            alert('Cập nhật thất bại!');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (!order) return <p>Không tìm thấy đơn hàng</p>;

    let currentStageIndex = 0;
    if (order.status === 'new') currentStageIndex = 1;
    if (order.status === 'processing') currentStageIndex = 3;
    if (order.status === 'shipping') currentStageIndex = 4;
    if (order.status === 'completed') currentStageIndex = 6;
    if (order.status === 'cancelled') currentStageIndex = 1;

    // === Tách sản phẩm khuyến mãi và thường ===
    const generateDisplayItems = (orderData) => {
        if (!orderData?.items || !Array.isArray(orderData.items)) return [];

        const items = orderData.items;
        const promotionSummary = orderData.promotionSummary || { discounts: [] };
        const displayRows = [];

        items.forEach((item) => {
            const product = item.product_id;
            const productId = product?._id || item._id;
            const productName = product?.name || item.productName;
            const basePrice = item.finalPrice || product.discountPrice || product.price;
            const promoItem = promotionSummary.discounts.find((d) => d.productId === productId);

            if (promoItem) {
                // 🎯 Dòng khuyến mãi
                if (promoItem.discountedQty > 0) {
                    const discountedPrice = basePrice - promoItem.discountPerItem;
                    const totalDiscounted = promoItem.discountedQty * discountedPrice;

                    displayRows.push({
                        key: `${productId}-promo`,
                        img: product.images?.[0] || '/no-image.png',
                        name: productName,
                        quantity: promoItem.discountedQty,
                        price: discountedPrice,
                        total: totalDiscounted,
                        isPromo: true,
                        promotionTitle: promoItem.promotionTitle,
                        gifts: item.gifts || [],
                    });
                }

                // 🎯 Dòng không khuyến mãi
                if (promoItem.normalQty > 0) {
                    const totalNormal = promoItem.normalQty * basePrice;
                    displayRows.push({
                        key: `${productId}-normal`,
                        img: product.images?.[0] || '/no-image.png',
                        name: productName,
                        quantity: promoItem.normalQty,
                        price: basePrice,
                        total: totalNormal,
                        isPromo: false,
                        gifts: item.gifts || [],
                    });
                }
            } else {
                // 🧱 Không khuyến mãi
                const total = basePrice * item.quantity;
                displayRows.push({
                    key: productId,
                    img: product.images?.[0] || '/no-image.png',
                    name: productName,
                    quantity: item.quantity,
                    price: basePrice,
                    total,
                    isPromo: false,
                    gifts: item.gifts || [],
                });
            }
        });

        return displayRows;
    };

    const displayItems = generateDisplayItems(order);

    return (
        <div className={cx('order-detail')}>
            {/* 👉 Ẩn invoice chỉ để in, không hiện trên UI */}
            <div style={{ display: 'none' }}>
                <Invoice ref={printRef} order={order} orderStages={orderStages} currentStageIndex={currentStageIndex} />
            </div>

            {/* Content */}
            {/* Header */}
            <div className={cx('header')}>
                <h1>Chi tiết đơn hàng #{order._id.slice(-6)}</h1>
                <span className={cx('status', order.status)}>{order.status}</span>
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
                        {displayItems.map((row) => (
                            <React.Fragment key={row.key}>
                                <tr className={cx({ 'promo-row': row.isPromo })}>
                                    <td className={cx('product-cell')}>
                                        <img src={row.img} alt={row.name} className={cx('product-img')} />
                                        <div>
                                            <span>{row.name}</span>
                                            {row.isPromo && (
                                                <div className={cx('promo-tag')}>
                                                    🎁 {row.promotionTitle || 'Áp dụng khuyến mãi'}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className={cx('text-center')}>{row.quantity}</td>
                                    <td className={cx('text-right')}>{row.price.toLocaleString('vi-VN')} ₫</td>
                                    <td className={cx('text-right')}>{row.total.toLocaleString('vi-VN')} ₫</td>
                                </tr>

                                {/* Quà tặng kèm nếu có */}
                                {row.gifts?.length > 0 && (
                                    <tr className={cx('gift-row')}>
                                        <td colSpan={4}>
                                            <div className={cx('gift-list')}>
                                                {row.gifts.map((gift, index) => (
                                                    <div key={index} className={cx('gift-item')}>
                                                        <img
                                                            src={gift.productId?.images?.[0] || '/no-image.png'}
                                                            alt={gift.productId?.name || 'Quà tặng'}
                                                            className={cx('gift-img')}
                                                        />
                                                        <span>
                                                            🎁 {gift.productId?.name || 'Quà tặng'} (SL: {gift.quantity}
                                                            )
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Hiển thị quà tặng cho từng sản phẩm nếu có */}
                {/* {order.items.some((item) => item.gifts && item.gifts.length > 0) && (
                    <div className={cx('gifts')}>
                        <h3>🎁 Quà tặng kèm</h3>

                        {order.items.map(
                            (item) =>
                                item.gifts &&
                                item.gifts.length > 0 && (
                                    <div key={item._id} className={cx('gift-item')}>
                                        <h4>Quà tặng cho: {item.product_id?.name || item.productName}</h4>
                                        <table className={cx('gift-table')}>
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th className={cx('text-center')}>Số lượng</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {item.gifts.map((gift) => {
                                                    const prod = gift.productId;
                                                    const img = prod?.images?.[0] || '/no-image.png';
                                                    return (
                                                        <tr key={prod?._id}>
                                                            <td className={cx('product-cell')}>
                                                                <img
                                                                    src={img}
                                                                    alt={prod?.name || 'Quà tặng'}
                                                                    className={cx('product-img')}
                                                                />
                                                                <span>{prod?.name || 'Quà tặng không xác định'}</span>
                                                            </td>
                                                            <td className={cx('text-center')}>{gift.quantity}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ),
                        )}
                    </div>
                )} */}
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

            {/* Action buttons */}
            <div className={cx('actions')}>
                <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={cx('status-select')}
                >
                    <option value="new">Mới</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>

                <button onClick={handleUpdateStatus} className={cx('btn', 'update')} disabled={updating}>
                    {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>

                <button onClick={handlePrint} className={cx('btn', 'print')}>
                    🖨️ In hóa đơn
                </button>

                <button className={cx('btn', 'delete')}>Xóa đơn hàng</button>

                <Link to="/admin/orders" className={cx('btn', 'back')}>
                    ← Quay lại
                </Link>
            </div>
        </div>
    );
};

export default OrderDetail;
