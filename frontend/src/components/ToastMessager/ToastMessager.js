import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './ToastMessager.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Context để dùng toast ở mọi nơi
const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
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
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export default ToastMessagerProvider;