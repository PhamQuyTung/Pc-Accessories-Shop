import React from 'react';
import classNames from 'classnames/bind';
import styles from '../CreateProduct.module.scss';

const cx = classNames.bind(styles);

export default function ProductSpecs({ specs, setSpecs }) {
    // Thêm nhóm mới
    const addGroup = () => {
        setSpecs([
            ...specs,
            { group: '', fields: [] }
        ]);
    };

    // Xoá nhóm
    const removeGroup = (groupIndex) => {
        setSpecs(specs.filter((_, i) => i !== groupIndex));
    };

    // Thêm field
    const addField = (groupIndex) => {
        const newSpecs = [...specs];
        newSpecs[groupIndex].fields.push({ label: '', value: '' });
        setSpecs(newSpecs);
    };

    // Xoá field
    const removeField = (groupIndex, fieldIndex) => {
        const newSpecs = [...specs];
        newSpecs[groupIndex].fields = newSpecs[groupIndex].fields.filter((_, fi) => fi !== fieldIndex);
        setSpecs(newSpecs);
    };

    // Edit group name
    const handleGroupChange = (groupIndex, value) => {
        const newSpecs = [...specs];
        newSpecs[groupIndex].group = value;
        setSpecs(newSpecs);
    };

    // Edit field label/value
    const handleFieldChange = (groupIndex, fieldIndex, key, value) => {
        const newSpecs = [...specs];
        newSpecs[groupIndex].fields[fieldIndex][key] = value;
        setSpecs(newSpecs);
    };

    return (
        <section className={cx('metabox')}>
            <h3 className={cx('title')}>Thông số kỹ thuật</h3>

            <button
                type="button"
                className={cx('btn')}
                onClick={addGroup}
            >
                + Thêm nhóm thông số
            </button>

            <div className={cx('spec-accordion')}>
                {specs.map((group, gIndex) => (
                    <div key={gIndex} className={cx('spec-group')}>
                        <details open>
                            <summary className={cx('spec-header')}>
                                <input
                                    placeholder="Tên nhóm (VD: CPU, RAM, VGA...)"
                                    value={group.group}
                                    onChange={(e) =>
                                        handleGroupChange(gIndex, e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className={cx('remove-group')}
                                    onClick={() => removeGroup(gIndex)}
                                >
                                    X
                                </button>
                            </summary>

                            <div className={cx('spec-fields')}>
                                {group.fields.map((field, fIndex) => (
                                    <div key={fIndex} className={cx('field-row')}>
                                        <input
                                            className={cx('label-input')}
                                            placeholder="Tên thông số"
                                            value={field.label}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    gIndex,
                                                    fIndex,
                                                    'label',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            className={cx('value-input')}
                                            placeholder="Giá trị"
                                            value={field.value}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    gIndex,
                                                    fIndex,
                                                    'value',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            className={cx('remove-field')}
                                            onClick={() =>
                                                removeField(gIndex, fIndex)
                                            }
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className={cx('btn')}
                                    onClick={() => addField(gIndex)}
                                >
                                    + Thêm thông số
                                </button>
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </section>
    );
}
