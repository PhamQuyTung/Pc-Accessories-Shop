import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './InputField.module.scss';
import { Eye, EyeOff } from 'lucide-react';

const cx = classNames.bind(styles);

function InputField({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    showToggle = false, // 👈 prop để bật/tắt icon mắt
}) {
    const [showPassword, setShowPassword] = useState(false);

    // Xác định kiểu type input dựa trên trạng thái showPassword và prop showToggle
    const inputType = showToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={cx('form-group')}>
            <label htmlFor={name} className={cx('label')}>
                {label}
            </label>

            <div className={cx('input-wrapper')}>
                <input
                    type={inputType}
                    id={name}
                    name={name}
                    className={cx('input', { 'input-error': error })}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                />
                {showToggle && type === 'password' && value && (
                    <span className={cx('toggle-password')} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                )}
            </div>

            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

export default InputField;
