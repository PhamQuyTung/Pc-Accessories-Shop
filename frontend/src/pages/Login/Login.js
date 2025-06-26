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
        name: '',
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
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast('Đăng nhập thành công!', 'success');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setServerError(err.response.data.message);
                toast(err.response.data.message, 'error');
            } else {
                setServerError('Tên đăng nhập hoặc mật khẩu không chính xác.');
                toast('Tên đăng nhập hoặc mật khẩu không chính xác.', 'error');
            }
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Đăng nhập</h2>
                <form className={cx('form')} onSubmit={handleSubmit}>
                    <InputField
                        label="Tên đăng nhập"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nhập tên đăng nhập..."
                    />
                    <InputField
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu..."
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
