import React, { useState } from 'react';
import classNames from 'classnames/bind';

import styles from './Register.module.scss';
import InputField from '../../components/InputField/InputField';

const cx = classNames.bind(styles);

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        // Clear server error on typing
        setServerError('');
        setSuccessMessage('');
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (!value.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: `${
                    name === 'confirmPassword'
                        ? 'Mật khẩu xác nhận'
                        : name === 'name'
                        ? 'Tên đăng nhập'
                        : name.charAt(0).toUpperCase() + name.slice(1)
                } không được để trống.`,
            }));
        }

        if (name === 'email' && value.trim() && !/\S+@\S+\.\S+/.test(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: 'Email không hợp lệ.',
            }));
        }

        if (name === 'confirmPassword' && value.trim() && value !== formData.password) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: 'Mật khẩu xác nhận không khớp.',
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên đăng nhập không được để trống.';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không được để trống.';
        }

        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setServerError(data.message || 'Đăng ký thất bại.');
            } else {
                setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập.');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });
            }
        } catch (err) {
            setServerError('Lỗi máy chủ. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Đăng Ký</h2>

                {serverError && <p className={cx('error-msg')}>{serverError}</p>}
                {successMessage && <p className={cx('success-msg')}>{successMessage}</p>}

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <InputField
                        label="Tên đăng nhập"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.name}
                        placeholder="Nhập tên đăng nhập..."
                    />
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        placeholder="Nhập email..."
                    />
                    <InputField
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        placeholder="Nhập mật khẩu..."
                    />
                    <InputField
                        label="Xác nhận mật khẩu"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.confirmPassword}
                        placeholder="Xác nhận mật khẩu..."
                    />
                    <button type="submit" className={cx('button')}>
                        Đăng Ký
                    </button>

                    <div className={cx('checkbox')}>
                        <input type="checkbox" id="terms" name="terms" />
                        <label htmlFor="terms">Tôi đồng ý với các điều khoản và điều kiện.</label>
                    </div>

                    <div className={cx('footer')}>
                        <p className={cx('footer-text')}>
                            Bạn đã có tài khoản? <a href="/login">Đăng nhập</a>
                        </p>
                        <p className={cx('footer-text')}>
                            Quay về <a href="/">trang chủ</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
