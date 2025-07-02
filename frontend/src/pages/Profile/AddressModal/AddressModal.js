import React, { useState, useEffect } from 'react';
import styles from './AddressModal.module.scss';
import classNames from 'classnames/bind';
import axios from 'axios';

const cx = classNames.bind(styles);

const AddressModal = ({ show, onClose, onSubmit, addressForm, handleChange }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        axios
            .get('https://provinces.open-api.vn/api/?depth=3')
            .then((res) => setProvinces(res.data))
            .catch((err) => console.error('Lỗi tải tỉnh/thành: ', err));
    }, []);

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

    if (!show) return null;

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal')}>
                <h3>Thêm địa chỉ mới</h3>
                <form onSubmit={onSubmit}>
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

                    <div className={cx('section-title')}>Địa chỉ</div>
                    <div className={cx('form-group-row')}>
                        <div>
                            <label>Tỉnh/Thành phố</label>
                            <select
                                value={addressForm.cityCode}
                                onChange={handleCityChange}
                                required
                            >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((city) => (
                                    <option key={city.code} value={city.code}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Quận/Huyện</label>
                            <select
                                value={addressForm.districtCode}
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
                        <div>
                            <label>Phường/Xã</label>
                            <select
                                value={addressForm.wardCode}
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
                        <button type="button" className={cx('cancel-btn')} onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;
