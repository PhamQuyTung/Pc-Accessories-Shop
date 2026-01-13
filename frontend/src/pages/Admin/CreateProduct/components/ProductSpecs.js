import React from 'react';
import classNames from 'classnames/bind';
import styles from '../CreateProduct.module.scss';

const cx = classNames.bind(styles);

export default function ProductSpecs({ specs, categorySpecs, setSpecs }) {
    if (!categorySpecs.length) {
        return (
            <section className={cx('metabox')}>
                <h3>Thông số kỹ thuật</h3>
                <p className={cx('hint')}>Danh mục này chưa có thông số kỹ thuật</p>
            </section>
        );
    }

    return (
        <section className={cx('metabox')}>
            <h3 className={cx('title')}>Thông số kỹ thuật</h3>

            <div className={cx('spec-grid')}>
                {categorySpecs.map((spec) => {
                    const productSpec = specs.find((s) => s.key === spec.key);

                    return (
                        <div key={spec.key} className={cx('spec-row')}>
                            <label className={cx('spec-label')}>
                                <span className={cx('icon', spec.icon)} />
                                {spec.label}
                            </label>

                            <input
                                type="text"
                                placeholder={`Nhập ${spec.label}`}
                                value={productSpec?.value || ''}
                                onChange={(e) =>
                                    setSpecs(
                                        specs.map((s) => (s.key === spec.key ? { ...s, value: e.target.value } : s)),
                                    )
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
