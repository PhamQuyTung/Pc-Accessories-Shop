import React, { useEffect, useState } from 'react';
import styles from './FilterSidebar.module.scss';
import classNames from 'classnames/bind';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

const cx = classNames.bind(styles);

export default function FilterSidebar({ filters, draftFilters, setDraftFilters, onApply, onReset }) {
    const [priceRange, setPriceRange] = useState([filters.priceMin, filters.priceMax]);

    // Reset khi min/max thay đổi
    useEffect(() => {
        setPriceRange([filters.priceMin, filters.priceMax]);
    }, [filters.priceMin, filters.priceMax]);

    // Khi kéo slider (chỉ update draft, chưa fetch)
    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);

        setDraftFilters({
            ...draftFilters,
            price: [`${newValue[0]}-${newValue[1]}`],
        });
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;

        setDraftFilters({
            ...draftFilters,
            [name]: value,
        });
    };

    if (!filters.priceMin || !filters.priceMax) return null;

    return (
        <div className={cx('filter-sidebar')}>
            {/* ================= PRICE ================= */}
            <div className={cx('filter-group')}>
                <label>Giá:</label>

                <Box sx={{ px: 1 }}>
                    <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        min={filters.priceMin}
                        max={filters.priceMax}
                        step={10000}
                        valueLabelDisplay="on"
                        valueLabelFormat={(value) => `${value.toLocaleString()}₫`}
                        sx={{
                            color: '#d70018',

                            '& .MuiSlider-thumb': {
                                width: 18,
                                height: 18,
                            },

                            // ===== CUSTOM TOOLTIP =====
                            '& .MuiSlider-valueLabel': {
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: '#d70018',
                                borderRadius: '8px',
                                padding: '6px 10px',
                            },

                            '& .MuiSlider-valueLabel:before': {
                                display: 'none', // bỏ mũi tên nhỏ nếu không thích
                            },
                        }}
                    />
                </Box>

                <div className={cx('price-values')}>
                    <span>{priceRange[0].toLocaleString()}₫</span>
                    <span>{priceRange[1].toLocaleString()}₫</span>
                </div>
            </div>

            {/* ================= BRAND ================= */}
            <div className={cx('filter-group')}>
                <label>Hãng:</label>
                <select name="brand" value={draftFilters.brand} onChange={handleSelectChange}>
                    <option value="">Tất cả</option>
                    {filters.brands.map((brand, index) => (
                        <option key={brand.slug || index} value={brand.slug}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= RAM ================= */}
            {filters.rams.length > 0 && (
                <div className={cx('filter-group')}>
                    <label>RAM:</label>
                    <select name="ram" value={draftFilters.ram} onChange={handleSelectChange}>
                        <option value="">Tất cả</option>
                        {filters.rams.map((ram, index) => (
                            <option key={`${ram}-${index}`} value={ram}>
                                {ram}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* ================= CPU ================= */}
            {filters.cpus.length > 0 && (
                <div className={cx('filter-group')}>
                    <label>CPU:</label>
                    <select name="cpu" value={draftFilters.cpu} onChange={handleSelectChange}>
                        <option value="">Tất cả</option>
                        {filters.cpus.map((cpu, index) => (
                            <option key={`${cpu}-${index}`} value={cpu}>
                                {cpu}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* ================= ACTION BUTTONS ================= */}
            <div className={cx('filter-actions')}>
                <button type="button" className={cx('reset-btn')} onClick={onReset}>
                    Bỏ chọn
                </button>

                <button type="button" className={cx('apply-btn')} onClick={onApply}>
                    Xem kết quả
                </button>
            </div>
        </div>
    );
}
