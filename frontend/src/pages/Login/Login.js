import styles from './Login.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Login() {
    return (
        <div className={cx('container')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Đăng Ký</h2>
                <form className={cx('form')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="name" className={cx('label')}>
                            Tên đăng nhập
                        </label>
                        <input type="text" id="name" className={cx('input')} placeholder="Nhập tên đăng nhập..." />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="password" className={cx('label')}>
                            Mật khẩu
                        </label>
                        <input type="password" id="password" className={cx('input')} placeholder="Nhập mật khẩu..." />
                    </div>
                    <div className={cx('form-forgotRemember')}>
                        {/* Nhớ mật khẩu */}
                        <div className={cx('form-remember')}>
                            <label htmlFor="remember" className={cx('checkbox-label')}>
                                <input type="checkbox" id="remember" className={cx('checkbox')} /> Nhớ mật khẩu
                            </label>
                        </div>
                        {/* Quên mật khẩu */}
                        <div className={cx('form-forgot')}>
                            <a href="/forgot-password" className={cx('forgot-password')}>
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>
                    <button type="submit" className={cx('button')}>
                        Đăng Ký
                    </button>
                </form>
                <p className={cx('footer')}>
                    Chưa có tài khoản?{' '}
                    <a href="/register" className={cx('link')}>
                        Đăng ký ngay
                    </a>
                </p>
                <p className={cx('footer')}>
                    Quay về{' '}
                    <a href="/" className={cx('link')}>
                        trang chủ
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;
