// components/CheckoutStep/CheckoutStep.js
import React from 'react';
import styles from './CheckoutStep.module.scss';
import classNames from 'classnames/bind';
import { FaShoppingCart, FaRegAddressCard, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const cx = classNames.bind(styles);

const steps = [
    { label: 'Giỏ hàng', icon: <FaShoppingCart /> },
    { label: 'Thông tin đặt hàng', icon: <FaRegAddressCard /> },
    { label: 'Thanh toán', icon: <FaCreditCard /> },
    { label: 'Hoàn tất', icon: <FaCheckCircle /> },
];

const CheckoutStep = ({ currentStep }) => {
    return (
        <div className={cx('step-container')}>
            <div className={cx('step-wrapper')}>
                {steps.map((step, index) => {
                    const isActive = index + 1 === currentStep;
                    const isCompleted = index + 1 < currentStep;
    
                    return (
                        <div key={index} className={cx('step-item')} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div
                                className={cx('circle', {
                                    active: isActive,
                                    completed: isCompleted,
                                })}
                            >
                                {step.icon}
                            </div>
                            <span
                                className={cx('label', {
                                    active: isActive,
                                    completed: isCompleted,
                                })}
                            >
                                {step.label}
                            </span>
                            {index !== steps.length - 1 && (
                                <div
                                    className={cx('line', {
                                        completed: isCompleted,
                                    })}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutStep;
