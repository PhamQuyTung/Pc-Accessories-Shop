import React, { useState, useMemo, useCallback, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './OrderCard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCopy, faCheck, faRedo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import ModalCancelOrder from '~/components/ModalCancelOrder/ModalCancelOrder';
import { useNavigate } from 'react-router-dom';
import cartEvent from '~/utils/cartEvent';

// Định nghĩa nhãn trạng thái đơn hàng
const STATUS_LABELS = {
    new: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    // Thêm các trạng thái khác nếu cần
};

const cx = classNames.bind(styles);

const transition = { duration: 0.3 };

const collapseVariants = {
    expanded: { height: 'auto', opacity: 1, overflow: 'visible', transition },
    collapsed: { height: 0, opacity: 0, overflow: 'hidden', transition },
};

// Hàm lấy ảnh sản phẩm, trả về đường dẫn ảnh hoặc ảnh mặc định nếu không có
function getProductImage(product) {
    if (product && product.images && product.images.length > 0) {
        return product.images[0];
    }
    return '/images/no-image.png';
}

function OrderCard({ order, onCancel }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const toggle = useCallback(() => setOpen((v) => !v), []);

    const totalItems = useMemo(() => order.items.reduce((sum, i) => sum + i.quantity, 0), [order.items]);

    const statusLabel = STATUS_LABELS[order.status] || order.status;

    const handleCopy = async (e) => {
        e.stopPropagation(); // tránh làm toggle accordion
        try {
            await navigator.clipboard.writeText(order._id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // fallback
            const textarea = document.createElement('textarea');
            textarea.value = order._id;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handleRepurchase = async (order) => {
        try {
            // Gọi API thêm từng sản phẩm vào giỏ hàng
            for (const item of order.items) {
                await axiosClient.post('/carts/add', {
                    product_id: item.product_id._id || item.product_id, // tùy backend trả về
                    quantity: item.quantity,
                });
            }
            toast('Đã thêm lại sản phẩm vào giỏ hàng!', 'success');
            cartEvent.emit('update-cart-count');
            navigate('/carts');
        } catch (err) {
            toast('Có lỗi khi mua lại đơn hàng!', 'error');
        }
    };

    const handleDeleteOrder = async (order) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Xóa đơn hàng',
            text: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Không',
        });
        if (isConfirmed) {
            await axiosClient.delete(`/orders/${order._id}`);
            toast('Đơn hàng đã được xóa!', 'success');
            if (onCancel) onCancel(); // Gọi lại fetchOrders để cập nhật danh sách
        }
    };

    // Hàm xác nhận hủy đơn hàng sau khi chọn lý do
    const handleConfirmCancel = async (reasons, otherReason) => {
        setShowCancelModal(false);
        const { isConfirmed } = await Swal.fire({
            title: 'Bạn chắc chắn muốn hủy đơn hàng?',
            text: 'Đơn hàng sẽ không thể khôi phục sau khi hủy.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Suy nghĩ lại',
        });
        if (isConfirmed) {
            await axiosClient.post(`/orders/${order._id}/cancel`, {
                reason:
                    reasons && reasons.length > 0
                        ? reasons.join(', ') + (otherReason ? `, ${otherReason}` : '')
                        : otherReason || 'Không rõ lý do',
            });
            toast('Hủy đơn hàng thành công!', 'success');
            if (onCancel) onCancel(); // Gọi lại fetchOrders để reload danh sách
        }
    };

    return (
        <div className={cx('order-card', { open })}>
            {/* HEADER */}
            <button className={cx('order-summary')} onClick={toggle} aria-expanded={open}>
                <motion.span className={cx('chevron')} animate={{ rotate: open ? 90 : 0 }} transition={transition}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </motion.span>

                <div className={cx('summary-main')}>
                    <div className={cx('row')}>
                        <span className={cx('label')}>Mã đơn:</span>
                        <span className={cx('order-id')}>
                            <strong>{order._id}</strong>
                            <span
                                role="button"
                                tabIndex={0}
                                className={cx('copy-btn')}
                                onClick={handleCopy}
                                aria-label="Copy mã đơn hàng"
                                title={copied ? 'Đã copy!' : 'Copy'}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCopy(e)}
                                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                            </span>
                        </span>
                    </div>
                    <div className={cx('row')}>
                        <span className={cx('label')}>Ngày đặt:</span>
                        <span>{new Date(order.createdAt).toLocaleString('vi-VN', { hour12: false })}</span>
                    </div>
                </div>

                <div className={cx('summary-right')}>
                    <span className={cx('status', order.status)}>{statusLabel}</span>
                    <span className={cx('count')}>{totalItems} sản phẩm</span>
                    <span className={cx('total')}>{order.totalAmount.toLocaleString()}₫</span>
                </div>
            </button>

            {/* BODY */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="details"
                        className={cx('order-detail')}
                        variants={collapseVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={transition}
                    >
                        <div className={cx('order-items')}>
                            {order.items.map((item, idx) => {
                                const product = item.product_id;
                                const isWithdrawn = !product || product.deleted || product.status === false;
                                const imageUrl = getProductImage(product);

                                return (
                                    <div key={idx} className={cx('order-item', { withdrawn: isWithdrawn })}>
                                        {isWithdrawn ? (
                                            <>
                                                <img
                                                    src="/images/no-image.png"
                                                    alt="Sản phẩm đã thu hồi"
                                                    className={cx('withdrawn-image')}
                                                />
                                                <div className={cx('item-info')}>
                                                    <p className={cx('withdrawn-label')}>⚠️ Sản phẩm đã bị thu hồi</p>
                                                    <p className={cx('name')}>{product?.name || 'Không xác định'}</p>
                                                    <p>Số lượng: {item.quantity}</p>
                                                    <p>
                                                        Giá: <strong>{item.price.toLocaleString()}₫</strong>
                                                    </p>
                                                    <p className={cx('refund-note')}>
                                                        Hệ thống sẽ hoàn lại tiền cho sản phẩm này.
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt={product?.name || 'Sản phẩm'}
                                                    onError={(e) => (e.currentTarget.src = '/images/no-image.png')}
                                                />
                                                <div className={cx('item-info')}>
                                                    <p className={cx('name')}>{product?.name}</p>
                                                    <p>Số lượng: {item.quantity}</p>
                                                    <p>
                                                        Giá: <strong>{item.price.toLocaleString()}₫</strong>
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className={cx('shipping-info')}>
                            <h4>Thông tin giao hàng</h4>
                            <p>
                                {order.shippingInfo?.name} - {order.shippingInfo?.phone}
                            </p>
                            <p>{order.shippingInfo?.address}</p>
                        </div>

                        {/* CANCEL BUTTON */}
                        {(order.status === 'new' || order.status === 'processing') && (
                            <div className={cx('cancel-btn-wrapper')}>
                                <button
                                    className={cx('cancel-btn-text')}
                                    onClick={() => setShowCancelModal(true)}
                                    title="Hủy đơn hàng"
                                >
                                    Hủy đơn hàng
                                </button>
                            </div>
                        )}

                        {/* CANCEL REASON */}
                        {order.status === 'cancelled' && (
                            <div className={cx('cancel-reason')}>
                                <strong>Lý do hủy:</strong> {order.cancelReason}
                            </div>
                        )}

                        {/* CANCEL ACTIONS */}
                        {order.status === 'cancelled' && (
                            <div className={cx('cancel-actions')}>
                                <button
                                    className={cx('restore-btn')}
                                    onClick={() => handleRepurchase(order)}
                                    title="Mua lại đơn hàng"
                                >
                                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: 6 }} />
                                    Mua lại
                                </button>
                                <button
                                    className={cx('delete-btn')}
                                    onClick={() => handleDeleteOrder(order)}
                                    title="Xóa đơn hàng"
                                >
                                    <FontAwesomeIcon icon={faTrash} style={{ marginRight: 6 }} />
                                    Xóa đơn
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL LÝ DO HỦY */}
            <ModalCancelOrder
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
}

export default React.memo(OrderCard);
