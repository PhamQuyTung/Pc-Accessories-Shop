// AddressModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './AddressModal.module.scss';
import classNames from 'classnames/bind';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

const cx = classNames.bind(styles);

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.98 },
};

export default function AddressModal({ show, onClose, onSubmit, addressForm, handleChange, mode = 'add' }) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        axios
            .get('https://provinces.open-api.vn/api/?depth=3')
            .then((res) => setProvinces(res.data))
            .catch((err) => console.error('Lỗi tải tỉnh/thành: ', err));
    }, []);

    useEffect(() => {
        if (!show) return;

        if (addressForm.cityCode) {
            const cityObj = provinces.find((p) => String(p.code) === String(addressForm.cityCode));
            setDistricts(cityObj?.districts || []);
        } else {
            setDistricts([]);
        }

        if (addressForm.districtCode && districts.length > 0) {
            const districtObj = districts.find((d) => String(d.code) === String(addressForm.districtCode));
            setWards(districtObj?.wards || []);
        } else {
            setWards([]);
        }
    }, [show, addressForm.cityCode, addressForm.districtCode, provinces, districts.length]);

    const handleCityChange = (e) => {
        const cityCode = e.target.value;
        const cityObj = provinces.find((p) => p.code.toString() === cityCode);

        setDistricts(cityObj?.districts || []);
        setWards([]);

        handleChange({ target: { name: 'city', value: cityObj?.name || '' } });
        handleChange({ target: { name: 'cityCode', value: cityCode } });

        handleChange({ target: { name: 'district', value: '' } });
        handleChange({ target: { name: 'districtCode', value: '' } });
        handleChange({ target: { name: 'ward', value: '' } });
        handleChange({ target: { name: 'wardCode', value: '' } });
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const districtObj = districts.find((d) => d.code.toString() === districtCode);

        setWards(districtObj?.wards || []);

        handleChange({ target: { name: 'district', value: districtObj?.name || '' } });
        handleChange({ target: { name: 'districtCode', value: districtCode } });
        handleChange({ target: { name: 'ward', value: '' } });
        handleChange({ target: { name: 'wardCode', value: '' } });
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardObj = wards.find((w) => w.code.toString() === wardCode);

        handleChange({ target: { name: 'ward', value: wardObj?.name || '' } });
        handleChange({ target: { name: 'wardCode', value: wardCode } });
    };

    const onCheckDefault = (e) => {
        handleChange({ target: { name: 'isDefault', value: e.target.checked } });
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={cx('modal-overlay')}
                    key="overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={cx('modal')}
                        key="modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <h3 className={cx('modal-title')}>
                            {mode === 'add' ? 'Thêm địa chỉ mới' : 'Cập nhật địa chỉ'}
                        </h3>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSubmit(e);
                            }}
                        >
                            {/* THÔNG TIN KHÁCH HÀNG */}
                            <h5 className={cx('section-title')}>Thông tin khách hàng</h5>
                            <div className={cx('form-group-col')}>
                                <div className={cx('input-wrapper')}>
                                    <label>Họ</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={addressForm.lastName || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={cx('input-wrapper')}>
                                    <label>Tên</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={addressForm.firstName || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group-col')}>
                                <div className={cx('input-wrapper')}>
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={addressForm.phone || ''}
                                        onChange={handleChange}
                                        required
                                        pattern="^(0|\+84)\d{9}$"
                                        title="Số điện thoại phải có 10 số và bắt đầu bằng 0 hoặc +84"
                                    />
                                </div>
                                <div className={cx('input-wrapper')}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={addressForm.email || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group-col')}>
                                <div className={cx('input-wrapper')}>
                                    <label>Mã bưu điện</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={addressForm.postalCode || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* ĐỊA CHỈ */}
                            <div className={cx('section-title')}>Địa chỉ</div>
                            <div className={cx('form-group-row')}>
                                <div className={cx('input-wrapper')}>
                                    <label>Tỉnh/Thành phố</label>
                                    <select value={addressForm.cityCode || ''} onChange={handleCityChange} required>
                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                        {provinces.map((city) => (
                                            <option key={city.code} value={city.code}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={cx('input-wrapper')}>
                                    <label>Quận/Huyện</label>
                                    <select
                                        value={addressForm.districtCode || ''}
                                        onChange={handleDistrictChange}
                                        required
                                        disabled={!districts.length}
                                    >
                                        <option value="">-- Chọn Quận/Huyện --</option>
                                        {districts.map((district) => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group-row')}>
                                <div className={cx('input-wrapper')}>
                                    <label>Phường/Xã</label>
                                    <select
                                        value={addressForm.wardCode || ''}
                                        onChange={handleWardChange}
                                        required
                                        disabled={!wards.length}
                                    >
                                        <option value="">-- Chọn Phường/Xã --</option>
                                        {wards.map((ward) => (
                                            <option key={ward.code} value={ward.code}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={cx('input-wrapper')}>
                                    <label>Số nhà / Ngõ / Đường</label>
                                    <input
                                        type="text"
                                        name="detail"
                                        value={addressForm.detail || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* LOẠI ĐỊA CHỈ */}
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
                                        value="company"
                                        checked={addressForm.type === 'company'}
                                        onChange={handleChange}
                                    />
                                    Văn phòng
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="other"
                                        checked={addressForm.type === 'other'}
                                        onChange={handleChange}
                                    />
                                    Khác
                                </label>
                            </div>

                            <label className={cx('checkbox')}>
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={!!addressForm.isDefault}
                                    onChange={(e) =>
                                        handleChange({ target: { name: 'isDefault', value: e.target.checked } })
                                    }
                                />
                                Đặt làm địa chỉ mặc định
                            </label>

                            <div className={cx('modal-actions')}>
                                <button type="submit" className={cx('submit-btn')}>
                                    {mode === 'add' ? 'Thêm địa chỉ' : 'Cập nhật'}
                                </button>
                                <button type="button" className={cx('cancel-btn')} onClick={onClose}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
