// components/AddressSelector/AddressSelector.js
import React, { useEffect, useState } from 'react';
import styles from './AddressSelector.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function AddressSelector({ value = {}, onChange }) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const { province = '', district = '', ward = '' } = value;

    // Fetch provinces
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/?depth=1')
            .then((res) => res.json())
            .then(setProvinces)
            .catch(console.error);
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        const selectedProvince = provinces.find((p) => p.name === province);
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.districts))
                .catch(console.error);
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [province]);

    // Fetch wards when district changes
    useEffect(() => {
        const selectedDistrict = districts.find((d) => d.name === district);
        if (selectedDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
                .then((res) => res.json())
                .then((data) => setWards(data.wards))
                .catch(console.error);
        } else {
            setWards([]);
        }
    }, [district]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...{ province, district, ward }, [name]: value });
    };

    return (
        <div className={cx('address-selector')}>
            <div className={cx('form-field')}>
                <label htmlFor="province">
                    Tỉnh / Thành phố<span>*</span>
                </label>
                <select name="province" required value={province} onChange={handleChange}>
                    <option value="">-- Chọn tỉnh --</option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.name}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={cx('form-field')}>
                <label htmlFor="district">
                    Quận / Huyện<span>*</span>
                </label>
                <select name="district" required value={district} onChange={handleChange} disabled={!province}>
                    <option value="">-- Chọn quận --</option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.name}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={cx('form-field')}>
                <label htmlFor="ward">
                    Phường / Xã<span>*</span>
                </label>
                <select name="ward" required value={ward} onChange={handleChange} disabled={!district}>
                    <option value="">-- Chọn phường --</option>
                    {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default AddressSelector;
