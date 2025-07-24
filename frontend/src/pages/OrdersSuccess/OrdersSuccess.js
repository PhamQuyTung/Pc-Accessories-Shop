import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './OrdersSuccess.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import CheckoutStep from '~/components/CheckoutStep/CheckoutStep';

const cx = classNames.bind(styles);

function OrdersSuccess() {
    const navigate = useNavigate();

    // Cuộn lên đầu khi load trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={cx('success-page')}>
            <CheckoutStep currentStep={4}/>

            <div className={cx('success-box')}>
                <FontAwesomeIcon icon={faCircleCheck} className={cx('success-icon')} />
                <h1 className={cx('title')}>Thanh toán thành công!</h1>
                <p className={cx('message')}>
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
                </p>

                <div className={cx('actions')}>
                    <Link to="/" className={cx('btn', 'btn-primary')}>
                        Về trang chủ
                    </Link>
                    <button onClick={() => navigate('/orders')} className={cx('btn', 'btn-secondary')}>
                        Xem đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrdersSuccess;
