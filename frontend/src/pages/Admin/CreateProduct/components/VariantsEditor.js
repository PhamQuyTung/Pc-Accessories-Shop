import React from 'react';
import classNames from 'classnames/bind';
import { AnimatePresence, motion } from 'framer-motion';
import VariantImage from '~/components/VariantImage/VariantImage';
import styles from '../CreateProduct.module.scss';
const cx = classNames.bind(styles);

export default function VariantsEditor({
    variants,
    handleVariantChange,
    toggleVariantOpen,
    editVariant,
    deleteVariant,
}) {
    if (!variants || variants.length === 0) return null;
    return (
        <div className={cx('variants-section')}>
            <h3 className={cx('variants-title')}>Tổ hợp biến thể</h3>
            <div className={cx('variants-list')}>
                {variants.map((v, i) => (
                    <div key={v.key || i} className={cx('variant-card')}>
                        <div className={cx('variant-header')} onClick={() => toggleVariantOpen(i)} role="button">
                            <div className={cx('variant-left')}>
                                <span className={cx('arrow', { open: v.isOpen })} aria-hidden>
                                    ▶
                                </span>
                                <span className={cx('variant-label')}>
                                    {v.attributes.map((a) => a.term?.name || a.termId).join(' — ')}
                                </span>
                            </div>
                            <div className={cx('variant-actions')}>
                                <button
                                    type="button"
                                    className={cx('btn', 'btn-edit')}
                                    onClick={(e) => editVariant(e, i)}
                                >
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    className={cx('btn', 'btn-delete')}
                                    onClick={(e) => deleteVariant(e, i)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {v.isOpen && (
                                <motion.div
                                    className="variant-body"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={cx('variant-body')}>
                                        <div className={cx('form-row', 'row-1')}>
                                            <VariantImage v={v} i={i} handleVariantChange={handleVariantChange} />
                                            <div className={cx('form-col', 'sku')}>
                                                <label>SKU</label>
                                                <input
                                                    type="text"
                                                    value={v.sku}
                                                    onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className={cx('form-row', 'row-2')}>
                                            <div className={cx('form-col', 'price')}>
                                                <label>Giá thường</label>
                                                <input
                                                    type="number"
                                                    value={v.price}
                                                    onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                                />
                                            </div>
                                            <div className={cx('form-col', 'discountPrice')}>
                                                <label>Giá khuyến mãi</label>
                                                <input
                                                    type="number"
                                                    value={v.discountPrice}
                                                    onChange={(e) =>
                                                        handleVariantChange(i, 'discountPrice', e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className={cx('form-row', 'row-3', 'column')}>
                                            <label>Số lượng</label>
                                            <input
                                                type="number"
                                                value={v.quantity}
                                                onChange={(e) => handleVariantChange(i, 'quantity', e.target.value)}
                                            />
                                        </div>

                                        <div className={cx('form-row', 'row-4')}>
                                            <div className={cx('form-col', 'weight')}>
                                                <label>Cân nặng (kg)</label>
                                                <input
                                                    type="number"
                                                    value={v.weight || 0}
                                                    onChange={(e) => handleVariantChange(i, 'weight', e.target.value)}
                                                />
                                            </div>
                                            <div className={cx('form-col', 'dimensions')}>
                                                <label>Kích thước (D x R x C) cm</label>
                                                <div className={cx('dimensions-inputs')}>
                                                    <input
                                                        type="number"
                                                        placeholder="Dài"
                                                        value={v.dimensions?.length || 0}
                                                        onChange={(e) =>
                                                            handleVariantChange(i, 'dimensions.length', e.target.value)
                                                        }
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Rộng"
                                                        value={v.dimensions?.width || 0}
                                                        onChange={(e) =>
                                                            handleVariantChange(i, 'dimensions.width', e.target.value)
                                                        }
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Cao"
                                                        value={v.dimensions?.height || 0}
                                                        onChange={(e) =>
                                                            handleVariantChange(i, 'dimensions.height', e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cx('form-row', 'row-5', 'column')}>
                                            <label>Mô tả ngắn</label>
                                            <textarea
                                                value={v.shortDescription || ''}
                                                onChange={(e) =>
                                                    handleVariantChange(i, 'shortDescription', e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
