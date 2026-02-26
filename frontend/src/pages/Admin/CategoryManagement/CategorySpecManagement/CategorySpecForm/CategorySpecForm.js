import { useState, useEffect } from 'react';
import SpecIconPicker from '~/components/SpecIconPicker/SpecIconPicker';
import styles from './CategorySpecForm.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function CategorySpecForm({ value = [], onChange }) {
    const [specs, setSpecs] = useState(value);

    useEffect(() => {
        // normalize incoming specs to ensure boolean flags exist
        if (Array.isArray(value)) {
            setSpecs(
                value.map((s) => ({
                    ...s,
                    showOnCard: !!s.showOnCard,
                    // undefined -> true
                    showOnTable: s.showOnTable !== false,
                })),
            );
        } else {
            setSpecs([]);
        }
    }, [value]);

    const updateSpecs = (next) => {
        setSpecs(next);
        onChange?.(next);
    };

    const addSpec = () => {
        updateSpecs([
            ...specs,
            {
                label: '',
                key: '',
                type: 'text',
                icon: 'default',
                showOnCard: false,
                showOnTable: true, // show by default when creating new spec
            },
        ]);
    };

    const updateSpec = (index, field, val) => {
        const next = [...specs];
        next[index] = {
            ...next[index],
            [field]: val,
        };
        updateSpecs(next);
    };

    const removeSpec = (index) => {
        updateSpecs(specs.filter((_, i) => i !== index));
    };

    return (
        <div className={cx('wrapper')}>
            <h3 className={cx('title')}>Thông số kỹ thuật theo danh mục</h3>

            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Tên hiển thị</th>
                        <th>Key</th>
                        <th>Kiểu</th>
                        <th>Card</th>
                        <th>Table</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {specs.map((spec, index) => (
                        <tr key={index}>
                            <td>
                                <SpecIconPicker
                                    value={spec.icon}
                                    onChange={(icon) => updateSpec(index, 'icon', icon)}
                                />
                            </td>

                            <td>
                                <input
                                    value={spec.label}
                                    placeholder="VD: RAM"
                                    onChange={(e) => updateSpec(index, 'label', e.target.value)}
                                />
                            </td>

                            <td>
                                <input
                                    value={spec.key}
                                    placeholder="ram"
                                    onChange={(e) => updateSpec(index, 'key', e.target.value)}
                                />
                            </td>

                            <td>
                                <select value={spec.type} onChange={(e) => updateSpec(index, 'type', e.target.value)}>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Select</option>
                                </select>
                            </td>

                            {/* ✅ SHOW ON CARD */}
                            <td style={{ textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!spec.showOnCard}
                                    onChange={(e) => updateSpec(index, 'showOnCard', e.target.checked)}
                                />
                            </td>

                            {/* ✅ SHOW ON TABLE */}
                            <td style={{ textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!spec.showOnTable}
                                    onChange={(e) => updateSpec(index, 'showOnTable', e.target.checked)}
                                />
                            </td>

                            {/* ❌ REMOVE */}
                            <td>
                                <button type="button" className={cx('remove')} onClick={() => removeSpec(index)}>
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="button" className={cx('add')} onClick={addSpec}>
                + Thêm spec
            </button>
        </div>
    );
}
