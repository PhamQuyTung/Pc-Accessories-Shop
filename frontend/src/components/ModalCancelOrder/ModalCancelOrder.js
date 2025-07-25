// ModalCancelOrder.jsx
import React, { useState } from 'react';
import styles from './ModalCancelOrder.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const REASONS = [
    'Thay đổi địa chỉ giao hàng',
    'Không muốn mua nữa',
    'Tìm được giá tốt hơn',
    'Lý do khác'
];

export default function ModalCancelOrder({ open, onClose, onConfirm }) {
    const [selected, setSelected] = useState([]);
    const [other, setOther] = useState('');

    const handleChange = (reason) => {
        setSelected((prev) =>
            prev.includes(reason)
                ? prev.filter((r) => r !== reason)
                : [...prev, reason]
        );
    };

    return open ? (
        <div className={cx("modal-cancel-order")}>
            <div className={cx("modal-content")}>
                <h3>Lý do hủy đơn hàng</h3>
                <form>
                    {REASONS.map((reason) => (
                        <label key={reason}>
                            <input
                                type="checkbox"
                                checked={selected.includes(reason)}
                                onChange={() => handleChange(reason)}
                            />
                            {reason}
                        </label>
                    ))}
                    {selected.includes('Lý do khác') && (
                        <textarea
                            placeholder="Nhập lý do khác..."
                            value={other}
                            onChange={e => setOther(e.target.value)}
                        />
                    )}
                </form>
                <div className={cx("modal-actions")}>
                    <button onClick={onClose}>Đóng</button>
                    <button
                        onClick={() => onConfirm(selected, other)}
                        disabled={selected.length === 0}
                    >
                        Xác nhận hủy
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}