import { useState, useEffect } from 'react';
import SpecIconPicker from '~/components/SpecIconPicker/SpecIconPicker';
import styles from './CategorySpecForm.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function CategorySpecForm({ value = [], onChange }) {
    const [specs, setSpecs] = useState(value);

    useEffect(() => {
        setSpecs(value || []);
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
            },
        ]);
    };

    const updateSpec = (index, field, val) => {
        const next = [...specs];
        next[index][field] = val;
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

                            <td>
                                <button className={cx('remove')} onClick={() => removeSpec(index)}>
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className={cx('add')} onClick={addSpec}>
                + Thêm spec
            </button>
        </div>
    );
}
