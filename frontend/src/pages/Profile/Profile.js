// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import AddressModal from './AddressModal/AddressModal';

const cx = classNames.bind(styles);

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        city: '',
        district: '',
        ward: '',
        detail: '',
        type: 'home',
    });

    // Lấy user từ localStorage
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : {};
    });

    // Nếu user thay đổi (ví dụ sau khi cập nhật profile), có thể cập nhật lại state
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressForm({ ...addressForm, [name]: value });
    };

    const handleSubmitAddress = (e) => {
        e.preventDefault();
        setShowAddressModal(false);
        setAddressForm({
            name: '',
            phone: '',
            city: '',
            district: '',
            ward: '',
            detail: '',
            type: 'home',
        });
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất',
            text: 'Bạn có chắc chắn muốn đăng xuất không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser({});
            navigate('/');
            window.location.reload();
        }
    };

    return (
        <div className={cx('profile-container')}>
            <div className={cx('sidebar')}>
                <div className={cx('avatar')}>
                    <div className={cx('circle')}>
                        {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <h2>{user.name || 'Tên người dùng'}</h2>
                </div>
                <ul className={cx('menu')}>
                    <li className={cx({ active: activeTab === 'info' })} onClick={() => setActiveTab('info')}>
                        Thông tin tài khoản
                    </li>
                    <li className={cx({ active: activeTab === 'address' })} onClick={() => setActiveTab('address')}>
                        Số địa chỉ
                    </li>
                    <li className={cx({ active: activeTab === 'orders' })} onClick={() => setActiveTab('orders')}>
                        Quản lý đơn hàng
                    </li>
                    <li className={cx({ active: activeTab === 'viewed' })} onClick={() => setActiveTab('viewed')}>
                        Sản phẩm đã thích
                    </li>
                    <li className={cx({ active: activeTab === 'logout' })} onClick={() => setActiveTab('logout')}>
                        Đăng xuất
                    </li>
                </ul>
            </div>
            <div className={cx('content')}>
                {activeTab === 'info' && (
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
                )}

                {activeTab === 'address' && (
                    <>
                        <div className={cx('address-header')}>
                            <h2>Số địa chỉ</h2>
                            <button className={cx('submit-btn')} onClick={() => setShowAddressModal(true)}>
                                + Thêm địa chỉ mới
                            </button>
                        </div>
                        <div className={cx('address-list')}>
                            <div className={cx('address-item')}>
                                <strong>Nhà riêng:</strong> 123 Đường ABC, Quận 1, TP.HCM
                                <br />
                                <span>Số điện thoại: 0123456789</span>
                            </div>
                            <div className={cx('address-item')}>
                                <strong>Công ty:</strong> 456 Đường XYZ, Quận 3, TP.HCM
                                <br />
                                <span>Số điện thoại: 0987654321</span>
                            </div>
                        </div>
                        {showAddressModal && (
                            <AddressModal
                                show={showAddressModal}
                                onClose={() => setShowAddressModal(false)}
                                onSubmit={handleSubmitAddress}
                                addressForm={addressForm}
                                handleChange={handleChange}
                                cx={cx}
                            />
                        )}
                    </>
                )}

                {activeTab === 'orders' && (
                    <>
                        <h2>Quản lý đơn hàng</h2>
                        <div>Chức năng quản lý đơn hàng sẽ hiển thị ở đây.</div>
                    </>
                )}

                {activeTab === 'viewed' && (
                    <>
                        <h2>Sản phẩm đã thích</h2>
                        <div>Danh sách sản phẩm đã thích sẽ hiển thị ở đây.</div>
                    </>
                )}

                {activeTab === 'logout' && (
                    <>
                        <h2>Đăng xuất</h2>
                        <div>Bạn có chắc chắn muốn đăng xuất không?</div>
                        <button className={cx('submit-btn')} onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
