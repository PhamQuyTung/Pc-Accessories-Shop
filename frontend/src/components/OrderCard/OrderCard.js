import React, { useState, useMemo, useCallback } from 'react';
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

const STATUS_LABELS = {
    new: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const cx = classNames.bind(styles);

const transition = { duration: 0.3 };

const collapseVariants = {
    expanded: { height: 'auto', opacity: 1, overflow: 'visible', transition },
    collapsed: { height: 0, opacity: 0, overflow: 'hidden', transition },
};

function getProductImage(product) {
    return product?.images?.[0] || '/images/no-image.png';
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

    console.log('Order data:', order);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(order._id);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = order._id;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleRepurchase = async () => {
        try {
            for (const item of order.items) {
                await axiosClient.post('/carts/add', {
                    product_id: item.product_id._id || item.product_id,
                    quantity: item.quantity,
                });
            }
            toast('Đã thêm lại sản phẩm vào giỏ hàng!', 'success');
            cartEvent.emit('update-cart-count');
            navigate('/carts');
        } catch {
            toast('Có lỗi khi mua lại đơn hàng!', 'error');
        }
    };

    const handleDeleteOrder = async () => {
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
            onCancel?.();
        }
    };

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
                    reasons?.join(', ') + (otherReason ? `, ${otherReason}` : '') || otherReason || 'Không rõ lý do',
            });
            toast('Hủy đơn hàng thành công!', 'success');
            onCancel?.();
        }
    };

    return (
        <div className={cx('order-card', { open })}>
            <button className={cx('order-summary')} onClick={toggle} aria-expanded={open}>
                <motion.span className={cx('chevron')} animate={{ rotate: open ? 90 : 0 }} transition={transition}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </motion.span>
                <div className={cx('summary-main')}>
                    <div className={cx('row')}>
                        <span className={cx('label')}>Mã đơn:</span>
                        <span className={cx('order-id')}>
                            <strong>{order._id}</strong>
                            <span className={cx('copy-btn')} onClick={handleCopy} title={copied ? 'Đã copy!' : 'Copy'}>
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
                    <p className={cx('total')}>
                        Tổng tiền: <strong>{formatCurrency(order.finalAmount ?? order.totalAmount)}</strong>
                    </p>
                </div>
            </button>

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
                                const withdrawn = !product || product.deleted || product.status === false;
                                const image = getProductImage(product);

                                return (
                                    <div key={idx} className={cx('order-item', { withdrawn })}>
                                        <img src={image} alt={product?.name || 'Sản phẩm'} />
                                        <div className={cx('item-info')}>
                                            <p className={cx('name')}>{product?.name || 'Không xác định'}</p>
                                            <p>Số lượng: {item.quantity}</p>
                                            <p>
                                                Giá: <strong>{item.price.toLocaleString()}₫</strong>
                                            </p>
                                            {withdrawn && (
                                                <p className={cx('refund-note')}>
                                                    ⚠️ Sản phẩm đã bị thu hồi. Hệ thống sẽ hoàn tiền.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={cx('price-breakdown')}>
                            <h4>Chi tiết thanh toán</h4>

                            <div className={cx('summary')}>
                                {order.subtotal !== undefined && (
                                    <div className={cx('row')}>
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                )}

                                {order.tax !== undefined && (
                                    <div className={cx('row')}>
                                        <span>Thuế (VAT):</span>
                                        <span>{order.tax === 0 ? 'FREE' : formatCurrency(order.tax)}</span>
                                    </div>
                                )}

                                {order.shippingFee !== undefined && (
                                    <div className={cx('row')}>
                                        <span>Phí vận chuyển:</span>
                                        <span>
                                            {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
                                        </span>
                                    </div>
                                )}

                                {order.serviceFee !== undefined && (
                                    <div className={cx('row')}>
                                        <span>Phí dịch vụ:</span>
                                        <span>
                                            {order.serviceFee === 0 ? 'FREE' : formatCurrency(order.serviceFee)}
                                        </span>
                                    </div>
                                )}

                                {order.discount !== undefined && order.discount > 0 && (
                                    <div className={cx('row', 'discount')}>
                                        <span>Mã giảm giá 10%:</span>
                                        <span>-{formatCurrency(order.discount)}</span>
                                    </div>
                                )}

                                <div className={cx('row', 'total')}>
                                    <span>Tổng thanh toán:</span>
                                    <span>{formatCurrency(order.finalAmount ?? order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={cx('shipping-info')}>
                            <h4>Thông tin giao hàng</h4>
                            <p>
                                {order.shippingInfo?.name} - {order.shippingInfo?.phone}
                            </p>
                            <p>{order.shippingInfo?.address}</p>
                        </div>

                        {(order.status === 'new' || order.status === 'processing') && (
                            <div className={cx('cancel-btn-wrapper')}>
                                <button className={cx('cancel-btn-text')} onClick={() => setShowCancelModal(true)}>
                                    Hủy đơn hàng
                                </button>
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <>
                                <div className={cx('cancel-reason')}>
                                    <strong>Lý do hủy:</strong> {order.cancelReason}
                                </div>
                                <div className={cx('cancel-actions')}>
                                    <button className={cx('restore-btn')} onClick={handleRepurchase}>
                                        <FontAwesomeIcon icon={faRedo} style={{ marginRight: 6 }} /> Mua lại
                                    </button>
                                    <button className={cx('delete-btn')} onClick={handleDeleteOrder}>
                                        <FontAwesomeIcon icon={faTrash} style={{ marginRight: 6 }} /> Xóa đơn
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ModalCancelOrder
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
}

export default React.memo(OrderCard);
