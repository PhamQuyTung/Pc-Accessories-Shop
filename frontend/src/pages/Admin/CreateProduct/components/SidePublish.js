import React from 'react';
import classNames from 'classnames/bind';
import styles from '../CreateProduct.module.scss';
import ConfirmNavigate from '~/components/ConfirmNavigate/ConfirmNavigate';
const cx = classNames.bind(styles);

export default function SidePublish({
    form,
    categories,
    brands,
    productType,
    variants,
    formImporting,
    handleFormChange,
    computeProductStatus,
    handleSubmit,
    hasUnsavedChanges,
    initialFormRef,
}) {
    return (
        <aside className={cx('side-col')}>
            <section className={cx('metabox')}>
                <h4 className={cx('title-sm')}>Publish</h4>

                <div className={cx('field')}>
                    <label>Danh mục</label>
                    <select name="category" value={form.category} onChange={handleFormChange}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('field')}>
                    <label>Thương hiệu</label>
                    <select name="brand" value={form.brand} onChange={handleFormChange} required>
                        <option value="">-- Chọn thương hiệu --</option>
                        {brands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>
                </div>

                {productType === 'simple' && (
                    <div className={cx('field')}>
                        <label>Số lượng</label>
                        <input
                            name="quantity"
                            type="number"
                            value={form.quantity}
                            onChange={handleFormChange}
                            min={0}
                        />
                    </div>
                )}

                <div className={cx('field')}>
                    <label>
                        <input type="checkbox" name="importing" checked={form.importing} onChange={handleFormChange} />
                        Đang nhập hàng
                    </label>
                </div>

                <div className={cx('field')}>
                    <label>Trạng thái dự kiến:</label>
                    <span className={cx('status-preview')}>
                        {computeProductStatus(
                            {
                                quantity: Number(form.quantity || 0),
                                variations:
                                    productType === 'variable'
                                        ? variants.map((v) => ({ quantity: Number(v.quantity || 0) }))
                                        : [],
                            },
                            { importing: form.importing },
                        )}
                    </span>
                </div>

                <div className={cx('actions')}>
                    <button type="submit" className={cx('btn', 'primary')} onClick={handleSubmit}>
                        Tạo sản phẩm
                    </button>

                    <ConfirmNavigate
                        to="/admin/products"
                        when={hasUnsavedChanges}
                        className={cx('btn', 'secondary')}
                        style={{ marginLeft: '8px' }}
                    >
                        Hủy
                    </ConfirmNavigate>
                </div>
            </section>
        </aside>
    );
}
