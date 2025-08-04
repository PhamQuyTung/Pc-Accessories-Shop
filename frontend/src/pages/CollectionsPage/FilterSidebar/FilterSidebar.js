// frontend/src/pages/CollectionsPage/FilterSidebar/FilterSidebar.js
import React, { useState } from 'react';
import styles from './FilterSidebar.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function FilterSidebar({ filters, onChange }) {
    const [selected, setSelected] = useState({
        price: '',
        brand: '',
        ram: '',
        cpu: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newSelected = { ...selected, [name]: value };
        setSelected(newSelected);
        onChange(newSelected); // gọi hàm cha
    };

    return (
        <div className={cx('filter-sidebar')}>
            <div className={cx('filter-group')}>
                <label>Giá:</label>
                <select name="price" value={selected.price} onChange={handleChange}>
                    <option value="">Tất cả</option>
                    {filters.priceRanges?.map((range, index) => (
                        <option key={index} value={range.value}>
                            {range.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={cx('filter-group')}>
                <label>Hãng:</label>
                <select name="brand" value={selected.brand} onChange={handleChange}>
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
                    <select name="ram" value={selected.ram} onChange={handleChange}>
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
                    <select name="cpu" value={selected.cpu} onChange={handleChange}>
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
