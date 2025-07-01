// src/pages/Profile.jsx
import React, { useState } from 'react';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Profile = () => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressForm({ ...addressForm, [name]: value });
    };

    const handleSubmitAddress = (e) => {
        e.preventDefault();
        // Xử lý lưu địa chỉ ở đây
        setShowAddressModal(false);
        // Reset form nếu muốn
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

    return (
        <div className={cx('profile-container')}>
            <div className={cx('sidebar')}>
                <div className={cx('avatar')}>
                    <div className={cx('circle')}>PQ</div>
                    <h2>PHẠM QUÝ TÙNG</h2>
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
                        Sản phẩm đã xem
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
                                <input type="text" defaultValue="PHẠM QUÝ TÙNG" />
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
                                <input type="email" defaultValue="pqthp18903@gmail.com" disabled />
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
                            <div className={cx('modal-overlay')}>
                                <div className={cx('modal')}>
                                    <h3>Thêm địa chỉ mới</h3>
                                    <form onSubmit={handleSubmitAddress}>
                                        {/* Thông tin khách hàng */}
                                        <h5 className={cx('section-title')}>Thông tin khách hàng</h5>
                                        <div className={cx('form-group-col')}>
                                            <div>
                                                <label>Họ và tên</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={addressForm.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label>Số điện thoại</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={addressForm.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Địa chỉ */}
                                        <div className={cx('section-title')}>Địa chỉ</div>
                                        <div className={cx('form-group-row')}>
                                            <div>
                                                <label>Tỉnh/Thành phố</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={addressForm.city}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label>Quận/Huyện</label>
                                                <input
                                                    type="text"
                                                    name="district"
                                                    value={addressForm.district}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className={cx('form-group-row')}>
                                            <div>
                                                <label>Phường/Xã</label>
                                                <input
                                                    type="text"
                                                    name="ward"
                                                    value={addressForm.ward}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label>Số nhà/ngõ/đường</label>
                                                <input
                                                    type="text"
                                                    name="detail"
                                                    value={addressForm.detail}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Loại địa chỉ */}
                                        <div className={cx('section-title')}>Loại địa chỉ</div>
                                        <div className={cx('address-type-row')}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="home"
                                                    checked={addressForm.type === 'home'}
                                                    onChange={handleChange}
                                                />
                                                Nhà riêng
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="office"
                                                    checked={addressForm.type === 'office'}
                                                    onChange={handleChange}
                                                />
                                                Văn phòng
                                            </label>
                                        </div>

                                        <div className={cx('modal-actions')}>
                                            <button type="submit" className={cx('submit-btn')}>Hoàn thành</button>
                                            <button type="button" className={cx('cancel-btn')} onClick={() => setShowAddressModal(false)}>Hủy</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
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
                        <h2>Sản phẩm đã xem</h2>
                        <div>Danh sách sản phẩm đã xem sẽ hiển thị ở đây.</div>
                    </>
                )}

                {activeTab === 'logout' && (
                    <>
                        <h2>Đăng xuất</h2>
                        <div>Bạn có chắc chắn muốn đăng xuất không?</div>
                        <button className={cx('submit-btn')}>Đăng xuất</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
