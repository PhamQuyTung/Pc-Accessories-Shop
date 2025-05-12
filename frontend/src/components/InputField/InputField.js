import React from 'react';
import classNames from 'classnames/bind';
import styles from './InputField.module.scss';

const cx = classNames.bind(styles);

function InputField({ label, type = 'text', name, value, onChange, onBlur, error, placeholder }) {
    return (
        <div className={cx('form-group')}>
            <label htmlFor={name} className={cx('label')}>
                {label}
            </label>

            <input
                type={type}
                id={name}
                name={name}
                className={cx('input', { 'input-error': error })}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />
            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

export default InputField;
