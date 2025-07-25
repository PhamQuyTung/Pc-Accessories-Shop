// src/pages/Profile/tabs/ProfileInfo.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../Profile.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export default function ProfileInfo() {
    const { user } = useOutletContext();

    return (
        <>
            <h2>Thông tin tài khoản</h2>
            <form className={cx('form')}>
                <label>
                    Họ Tên
                    <input type="text" defaultValue={user.name || ''} />
                </label>
                <label>Giới tính</label>
                <div className={cx('radio-group')}>
                    <label>
                        <input type="radio" name="gender" defaultChecked /> Nam
                    </label>
                    <label>
                        <input type="radio" name="gender" /> Nữ
                    </label>
                </div>
                <label>
                    Email
                    <input type="email" defaultValue={user.email || ''} disabled />
                </label>
                <label>Ngày sinh</label>
                <div className={cx('dob')}>
                    <select>
                        <option>Ngày</option>
                    </select>
                    <select>
                        <option>Tháng</option>
                    </select>
                    <select>
                        <option>Năm</option>
                    </select>
                </div>
                <button className={cx('submit-btn')} type="submit">
                    Lưu thay đổi
                </button>
            </form>
        </>
    );
}
