import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './ToastMessager.module.scss';
import classNames from 'classnames/bind';
import { WarningIcon } from '../Icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';

const cx = classNames.bind(styles);

// Context để dùng toast ở mọi nơi
const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

function getToastIcon(type) {
    switch (type) {
        case 'success':
            return (
                <span style={{ marginRight: 8 }}>
                    <FontAwesomeIcon icon={faCircleCheck} className={cx('custom-icon__toast')} />
                </span>
            ); // Dấu tích
        case 'warning':
            return (
                <span style={{ marginRight: 8 }}>
                    <WarningIcon className={cx('custom-icon__toast')} />
                </span>
            ); // Biển cảnh báo
        case 'error':
            return (
                <span style={{ marginRight: 8 }}>
                    <FontAwesomeIcon icon={faCircleXmark} className={cx('custom-icon__toast')} />
                </span>
            ); // Dấu X
        case 'info':
            return (
                <span style={{ marginRight: 8 }}>
                    <FontAwesomeIcon icon={faCircleCheck} className={cx('custom-icon__toast')} />
                </span>
            ); // Biểu tượng thông tin
        default:
            return null;
    }
}

function ToastMessagerProvider({ children }) {
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    const showToast = useCallback((message, type = 'success', duration = 2000) => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast({ message: '', type: '', visible: false });
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast.visible && (
                <div className={cx('toast', toast.type)}>
                    {getToastIcon(toast.type)}
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export default ToastMessagerProvider;
