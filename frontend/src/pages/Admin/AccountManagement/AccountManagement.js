// src/pages/admin/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from './AccountManagement.module.scss';

const cx = classNames.bind(styles);

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/accounts');
                setAccounts(res.data);
            } catch (err) {
                console.error('Lỗi khi tải người dùng:', err);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className={cx('user-management')}>
            <div className={cx('header')}>
                <h2>Quản lý người dùng</h2>
                <button className={cx('btn-add')}>
                    <Link to="/register">+ Thêm tài khoản</Link>
                </button>
            </div>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên người dùng</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account, index) => (
                        <tr key={account._id}>
                            <td>{index + 1}</td>
                            <td>{account.name}</td>
                            <td>{account.email}</td>
                            <td>{account.role}</td>
                            <td>{new Date(account.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <button className={cx('btn-edit')}>✏️</button>
                                <button className={cx('btn-delete')}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AccountManagement;
