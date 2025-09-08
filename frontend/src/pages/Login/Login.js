import React, { useState } from 'react';
import axios from 'axios';
import InputField from '~/components/InputField';
import styles from './Login.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);

            // ✅ Lưu thông tin vào localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('role', res.data.user.role); // 👈 thêm dòng này

            toast('Đăng nhập thành công!', 'success');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            const message = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
            setServerError(message);
            toast(message, 'error');
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Đăng nhập</h2>
                <form className={cx('form')} onSubmit={handleSubmit}>
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email..."
                    />

                    <InputField
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu..."
                        showToggle // 👈 bật icon mắt
                    />

                    {serverError && <div className={cx('error')}>{serverError}</div>}

                    <div className={cx('remember-forgot')}>
                        <label className={cx('remember')}>
                            <input type="checkbox" /> Ghi nhớ mật khẩu
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
                            Bạn chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                        </p>
                        <p className={cx('footer-text')}>
                            hoặc quay về <a href="/">trang chủ</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
