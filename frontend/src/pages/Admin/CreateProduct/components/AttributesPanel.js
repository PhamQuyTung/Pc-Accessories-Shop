import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from '../CreateProduct.module.scss';
const cx = classNames.bind(styles);

export default function AttributesPanel({
    allAttributes,
    attributeTermsMap,
    productAttributes,
    addAttributeToProduct,
    removeProductAttribute,
    toggleUseForVariations,
    toggleTermForAttribute,
    generateVariantCombinations,
}) {
    return (
        <section className={cx('metabox')}>
            <h3 className={cx('title')}>Thuộc tính (Attributes)</h3>

            <div className={cx('attr-pick')}>
                <div className={cx('attr-list')}>
                    {allAttributes
                        .filter((a) => Array.isArray(attributeTermsMap[a._id]) && attributeTermsMap[a._id].length > 0)
                        .map((a) => (
                            <button
                                key={a._id}
                                type="button"
                                className={cx('chip')}
                                onClick={() => addAttributeToProduct(a._id)}
                            >
                                {a.name}
                            </button>
                        ))}
                </div>

                <div className={cx('product-attributes')}>
                    {productAttributes.length === 0 ? (
                        <p className={cx('no-attributes')}>Chưa có thuộc tính nào, vui lòng thêm thuộc tính</p>
                    ) : (
                        <AnimatePresence>
                            {productAttributes
                                .filter(
                                    (attr) =>
                                        Array.isArray(attributeTermsMap[attr.attrId]) &&
                                        attributeTermsMap[attr.attrId].length > 0,
                                )
                                .map((attr) => (
                                    <motion.div
                                        key={attr.attrId}
                                        className={cx('attr-card')}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className={cx('attr-header')}>
                                            <strong>{attr.name}</strong>
                                            <button type="button" onClick={() => removeProductAttribute(attr.attrId)}>
                                                X
                                            </button>
                                        </div>

                                        <div className={cx('attr-body')}>
                                            <label className={cx('term', 'dp-flex')}>
                                                <input
                                                    type="checkbox"
                                                    checked={attr.useForVariations}
                                                    onChange={(e) =>
                                                        toggleUseForVariations(attr.attrId, e.target.checked)
                                                    }
                                                />
                                                Dùng cho biến thể
                                            </label>

                                            <div className={cx('terms')}>
                                                {(attributeTermsMap[attr.attrId] || []).map((t) => {
                                                    const isChecked =
                                                        Array.isArray(attr.terms) &&
                                                        attr.terms.some((termId) => String(termId) === String(t._id));
                                                    return (
                                                        <label key={t._id} className={cx('term', 'dp-flex')}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) =>
                                                                    toggleTermForAttribute(
                                                                        attr.attrId,
                                                                        t._id,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                            {t.name}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className={cx('attr-actions')}>
                    <button type="button" className={cx('btn')} onClick={generateVariantCombinations}>
                        Tạo biến thể từ thuộc tính
                    </button>
                </div>
            </div>
        </section>
    );
}
