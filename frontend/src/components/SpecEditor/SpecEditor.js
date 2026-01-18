import React, { memo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from '../../pages/Admin/ProductVariants/EditVariant/EditVariant.module.scss';

const cx = classNames.bind(styles);

function SpecEditor({ uiSpecs, setUiSpecs }) {
    const handleChange = useCallback(
        (idx, value) => {
            setUiSpecs((prev) => {
                const clone = structuredClone(prev);
                clone[idx].value = value;
                clone[idx].overridden = value !== clone[idx].baseValue;
                return clone;
            });
        },
        [setUiSpecs],
    );

    const handleReset = useCallback(
        (idx) => {
            setUiSpecs((prev) => {
                const clone = structuredClone(prev);
                clone[idx].value = clone[idx].baseValue;
                clone[idx].overridden = false;
                return clone;
            });
        },
        [setUiSpecs],
    );

    return (
        <div className={cx('spec-editor')}>
            {uiSpecs.map((spec, idx) => (
                <div key={spec.key} className={cx('spec-row', { overridden: spec.overridden })}>
                    <div className={cx('spec-label')}>
                        {spec.label}
                        {spec.overridden && <span className={cx('override-badge')}>Override</span>}
                    </div>

                    <div className={cx('spec-input')}>
                        <input value={spec.value ?? ''} onChange={(e) => handleChange(idx, e.target.value)} />

                        {spec.overridden && (
                            <button type="button" className={cx('reset-btn')} onClick={() => handleReset(idx)}>
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(SpecEditor);
