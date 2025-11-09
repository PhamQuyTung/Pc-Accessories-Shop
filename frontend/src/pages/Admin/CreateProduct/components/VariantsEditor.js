import React from 'react';
import classNames from 'classnames/bind';
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

    const stockOptions = [
        { value: 'in_stock', label: 'In stock' },
        { value: 'out_of_stock', label: 'Out of stock' },
        { value: 'on_backorder', label: 'On backorder' },
    ];

    return (
        <div className={cx('variants-section')}>
            <h3 className={cx('variants-title')}>Tổ hợp biến thể</h3>

            <div className={cx('variants-table')}>
                {variants.map((v, i) => (
                    <div key={v.key || i} className={cx('variant-panel')}>
                        <div className={cx('variant-panel__head')}>
                            <div className={cx('head-left')}>
                                <button
                                    type="button"
                                    className={cx('expand-toggle')}
                                    onClick={() => toggleVariantOpen(i)}
                                    aria-expanded={!!v.isOpen}
                                >
                                    {v.isOpen ? '▾' : '▸'}
                                </button>
                                <div className={cx('head-attributes')}>
                                    {(v.attributes || []).map((a) => (
                                        <span key={`${a.attributeId}-${a.termId}`} className={cx('attr-chip')}>
                                            {a.term?.name || a.termId}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={cx('head-right')}>
                                <div className={cx('sku-wrap')}>
                                    <label>SKU</label>
                                    <input
                                        className={cx('input-sku')}
                                        value={v.sku || ''}
                                        onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                                        placeholder="Mã sản phẩm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={cx('variant-panel__body', { open: !!v.isOpen })}>
                            <div className={cx('body-left')}>
                                <div className={cx('thumb-box')}>
                                    <VariantImage v={v} i={i} handleVariantChange={handleVariantChange} small />
                                </div>
                            </div>

                            <div className={cx('body-right')}>
                                <div className={cx('row', 'prices-row')}>
                                    <div className={cx('col')}>
                                        <label>Regular price (₫)</label>
                                        <input
                                            type="number"
                                            value={v.price || ''}
                                            onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                            className={cx('input')}
                                            placeholder="Giá thường"
                                        />
                                    </div>

                                    <div className={cx('col')}>
                                        <label>Sale price (₫)</label>
                                        <input
                                            type="number"
                                            value={v.discountPrice || ''}
                                            onChange={(e) => handleVariantChange(i, 'discountPrice', e.target.value)}
                                            className={cx('input')}
                                            placeholder="Giá khuyến mại"
                                        />
                                    </div>

                                    {/* <div className={cx('col')}>
                                        <label>Stock status</label>
                                        <select
                                            value={v.stockStatus || 'in_stock'}
                                            onChange={(e) => handleVariantChange(i, 'stockStatus', e.target.value)}
                                            className={cx('input')}
                                        >
                                            {stockOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}
                                </div>

                                <div className={cx('row', 'stock-row')}>
                                    <label className={cx('manage-stock')}>
                                        <input
                                            type="checkbox"
                                            checked={!!v.manageStock}
                                            onChange={(e) => handleVariantChange(i, 'manageStock', e.target.checked)}
                                        />{' '}
                                        Manage stock?
                                    </label>

                                    {v.manageStock && (
                                        <div className={cx('col-qty')}>
                                            <label>Stock qty</label>
                                            <input
                                                type="number"
                                                value={v.quantity || 0}
                                                onChange={(e) => handleVariantChange(i, 'quantity', e.target.value)}
                                                className={cx('input')}
                                                min={0}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={cx('row', 'dims-row')}>
                                    <div className={cx('col-dim')}>
                                        <label>Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={v.weight || 0}
                                            onChange={(e) => handleVariantChange(i, 'weight', e.target.value)}
                                            className={cx('input')}
                                        />
                                    </div>

                                    <div className={cx('col-dimwide')}>
                                        <label>Dimensions (L × W × H) cm</label>
                                        <div className={cx('dims')}>
                                            <input
                                                type="number"
                                                value={(v.dimensions && v.dimensions.length) || 0}
                                                onChange={(e) =>
                                                    handleVariantChange(i, 'dimensions.length', e.target.value)
                                                }
                                                className={cx('input-mini')}
                                                placeholder="L"
                                            />
                                            <input
                                                type="number"
                                                value={(v.dimensions && v.dimensions.width) || 0}
                                                onChange={(e) =>
                                                    handleVariantChange(i, 'dimensions.width', e.target.value)
                                                }
                                                className={cx('input-mini')}
                                                placeholder="W"
                                            />
                                            <input
                                                type="number"
                                                value={(v.dimensions && v.dimensions.height) || 0}
                                                onChange={(e) =>
                                                    handleVariantChange(i, 'dimensions.height', e.target.value)
                                                }
                                                className={cx('input-mini')}
                                                placeholder="H"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('row', 'desc-row')}>
                                    <label>Description</label>
                                    <textarea
                                        value={v.shortDescription || ''}
                                        onChange={(e) => handleVariantChange(i, 'shortDescription', e.target.value)}
                                        className={cx('textarea')}
                                        rows={3}
                                        placeholder="Mô tả ngắn biến thể"
                                    />
                                </div>

                                <div className={cx('row', 'actions-row')}>
                                    <button
                                        type="button"
                                        className={cx('btn', 'btn-primary')}
                                        onClick={(e) => editVariant(e, i)}
                                    >
                                        Save changes
                                    </button>
                                    <button
                                        type="button"
                                        className={cx('btn', 'btn-danger')}
                                        onClick={(e) => deleteVariant(e, i)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
