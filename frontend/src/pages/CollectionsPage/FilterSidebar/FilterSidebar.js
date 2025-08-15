// frontend/src/pages/CollectionsPage/FilterSidebar/FilterSidebar.js
import React, { useState } from 'react';
import styles from './FilterSidebar.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function FilterSidebar({ filters, onChange }) {
    const [selected, setSelected] = useState({
        price: [],
        brand: '',
        ram: '',
        cpu: '',
    });

    const handlePriceChange = (value) => {
        let newPrices = [...selected.price];
        if (newPrices.includes(value)) {
            newPrices = newPrices.filter((p) => p !== value);
        } else {
            newPrices.push(value);
        }
        const newSelected = { ...selected, price: newPrices };
        setSelected(newSelected);
        onChange(newSelected);
    };

    const handleOtherChange = (e) => {
        const { name, value } = e.target;
        const newSelected = { ...selected, [name]: value };
        setSelected(newSelected);
        onChange(newSelected);
    };

    return (
        <div className={cx('filter-sidebar')}>
            <div className={cx('filter-group')}>
                <label>Giá:</label>
                {filters.priceRanges?.map((range, index) => (
                    <div key={index} className={cx('checkbox-item')}>
                        <input
                            type="checkbox"
                            id={`price-${index}`}
                            checked={selected.price.includes(range.value)}
                            onChange={() => handlePriceChange(range.value)}
                        />
                        <label htmlFor={`price-${index}`}>{range.label}</label>
                    </div>
                ))}
            </div>

            <div className={cx('filter-group')}>
                <label>Hãng:</label>
                <select name="brand" value={selected.brand} onChange={handleOtherChange}>
                    <option value="">Tất cả</option>
                    {filters.brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
            </div>

            {filters.rams.length > 0 && (
                <div className={cx('filter-group')}>
                    <label>RAM:</label>
                    <select name="ram" value={selected.ram} onChange={handleOtherChange}>
                        <option value="">Tất cả</option>
                        {filters.rams.map((ram) => (
                            <option key={ram} value={ram}>
                                {ram}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {filters.cpus.length > 0 && (
                <div className={cx('filter-group')}>
                    <label>CPU:</label>
                    <select name="cpu" value={selected.cpu} onChange={handleOtherChange}>
                        <option value="">Tất cả</option>
                        {filters.cpus.map((cpu) => (
                            <option key={cpu} value={cpu}>
                                {cpu}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
