import React, { memo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from '../../pages/Admin/ProductVariants/EditVariant/EditVariant.module.scss';

const cx = classNames.bind(styles);

function SpecEditor({ uiSpecs, productSpecs, setUiSpecs }) {
    const isOverridden = useCallback(
        (groupName, label, value) => {
            const baseGroup = productSpecs.find((g) => g.group === groupName);
            if (!baseGroup) return true;

            const baseField = baseGroup.fields.find((f) => f.label === label);
            if (!baseField) return true;

            return value !== baseField.value;
        },
        [productSpecs],
    );

    const handleChange = useCallback(
        (gIdx, fIdx, value) => {
            setUiSpecs((prev) => {
                const clone = structuredClone(prev);
                clone[gIdx].fields[fIdx].value = value;
                return clone;
            });
        },
        [setUiSpecs],
    );

    const handleReset = useCallback(
        (groupName, label, gIdx, fIdx) => {
            const baseGroup = productSpecs.find((g) => g.group === groupName);
            const baseField = baseGroup?.fields.find((f) => f.label === label);
            if (!baseField) return;

            setUiSpecs((prev) => {
                const clone = structuredClone(prev);
                clone[gIdx].fields[fIdx].value = baseField.value;
                return clone;
            });
        },
        [productSpecs, setUiSpecs],
    );

    return (
        <div className={cx('spec-editor')}>
            {uiSpecs.map((group, gIdx) => (
                <div key={group.group} className={cx('spec-card')}>
                    <div className={cx('spec-card-header')}>
                        <h4>{group.group}</h4>
                    </div>

                    <div className={cx('spec-card-body')}>
                        {group.fields.map((field, fIdx) => {
                            const overridden = isOverridden(
                                group.group,
                                field.label,
                                field.value,
                            );

                            return (
                                <div
                                    key={field.label}
                                    className={cx('spec-row', { overridden })}
                                >
                                    <div className={cx('spec-label')}>
                                        {field.label}
                                        {overridden && (
                                            <span className={cx('override-badge')}>
                                                Override
                                            </span>
                                        )}
                                    </div>

                                    <div className={cx('spec-input')}>
                                        <input
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    gIdx,
                                                    fIdx,
                                                    e.target.value,
                                                )
                                            }
                                        />

                                        {overridden && (
                                            <button
                                                type="button"
                                                className={cx('reset-btn')}
                                                onClick={() =>
                                                    handleReset(
                                                        group.group,
                                                        field.label,
                                                        gIdx,
                                                        fIdx,
                                                    )
                                                }
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(SpecEditor);
