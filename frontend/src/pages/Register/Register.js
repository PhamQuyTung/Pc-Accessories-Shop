import styles from './Register.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Register() {
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
                        <label htmlFor="email" className={cx('label')}>
                            Email
                        </label>
                        <input type="email" id="email" className={cx('input')} placeholder="Nhập email..." />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="password" className={cx('label')}>
                            Mật khẩu
                        </label>
                        <input type="password" id="password" className={cx('input')} placeholder="Nhập mật khẩu..." />
                    </div>
                    <div className={cx('form-group')}>
                        <label htmlFor="confirm-password" className={cx('label')}>
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            className={cx('input')}
                            placeholder="Xác nhận mật khẩu..."
                        />
                    </div>
                    <button type="submit" className={cx('button')}>
                        Đăng Ký
                    </button>
                </form>
                <p className={cx('footer')}>
                    Đã có tài khoản?{' '}
                    <a href="/login" className={cx('link')}>
                        Đăng Nhập
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

export default Register;
