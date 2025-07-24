import React, { useState, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './OrderCard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const cx = classNames.bind(styles);

const STATUS_LABELS = {
    new: 'Mới',
    processing: 'Đang xử lý',
    shipping: 'Đang vận chuyển',
    completed: 'Hoàn thành',
    cancelled: 'Hủy',
};

function getProductImage(p) {
    if (!p) return '/images/no-image.png';
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    if (typeof p.image === 'string') return p.image;
    return '/images/no-image.png';
}

const collapseVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 },
};

const transition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

function OrderCard({ order }) {
    const [open, setOpen] = useState(false);

    const toggle = useCallback(() => setOpen((v) => !v), []);

    const totalItems = useMemo(() => order.items.reduce((sum, i) => sum + i.quantity, 0), [order.items]);

    const statusLabel = STATUS_LABELS[order.status] || order.status;

    return (
        <div className={cx('order-card', { open })}>
            {/* HEADER */}
            <button className={cx('order-summary')} onClick={toggle} aria-expanded={open}>
                {/* Chevron animate xoay */}
                <motion.span className={cx('chevron')} animate={{ rotate: open ? 90 : 0 }} transition={transition}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </motion.span>

                <div className={cx('summary-main')}>
                    <div className={cx('row')}>
                        <span className={cx('label')}>Mã đơn:</span>
                        <strong>{order._id}</strong>
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
                                const imageUrl = getProductImage(product);

                                return (
                                    <div key={idx} className={cx('order-item')}>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default React.memo(OrderCard);
