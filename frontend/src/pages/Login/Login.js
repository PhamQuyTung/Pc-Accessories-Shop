import React, { useState } from 'react';
import InputField from '~/components/InputField';
import styles from './Login.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Login() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Cập nhật giá trị input
        setFormData({ ...formData, [name]: value });

        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        // Kiểm tra nếu input bị bỏ trống khi mất focus
        if (!value.trim()) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: `${name === 'confirmPassword' ? 'Mật khẩu xác nhận' : name === 'name' ? 'Tên đăng nhập' : name.charAt(0).toUpperCase() + name.slice(1)} không được để trống.`,
            }));
        }

        // Kiểm tra thêm các lỗi cụ thể (ví dụ: email không hợp lệ)
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
            newErrors.confirmPassword = 'Mật khẩu không được để trống.';
        }

        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            console.log('Form submitted successfully:', formData);
            // Thực hiện logic gửi dữ liệu lên server tại đây
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Đăng nhập</h2>
                <form action="#" className={cx('form')} onSubmit={handleSubmit}>
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
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        placeholder="Nhập mật khẩu..."
                    />

                    {/* Remember password and Forgot password*/}
                    <div className={cx('remember-forgot')}>
                        <label className={cx('remember')}>
                            <input type="checkbox" />{' '}
                            Ghi nhớ mật khẩu
                        </label>
                        <a href="/forgot-password" className={cx('forgot-password')}>
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button type="submit" className={cx('button')}>
                        Đăng nhập
                    </button>

                    <div className={cx('footer')}>
                        <p className={cx('footer-text')}>
                            Bạn chưa có tài khoản? <a href="/register">Đăng ký ngay!</a>
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

export default Login;
