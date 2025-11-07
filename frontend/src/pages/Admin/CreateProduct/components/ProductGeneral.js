import React from 'react';
import ReactQuill from 'react-quill-new';
import CustomToolbar from '~/components/Editor/CustomToolbar';
import { quillFormats, quillModules } from '~/utils/quillSetup';
import classNames from 'classnames/bind';
import styles from '../CreateProduct.module.scss';
const cx = classNames.bind(styles);

export default function ProductGeneral({ form, handleFormChange, addImageField, removeImageField, productType }) {
    return (
        <section className={cx('metabox')}>
            <h3 className={cx('title')}>Thông tin chung</h3>

            <div className={cx('field')}>
                <label>Tên sản phẩm</label>
                <input name="name" value={form.name} onChange={handleFormChange} required />
            </div>

            <div className={cx('field')}>
                <label>Mô tả ngắn</label>
                <CustomToolbar id="toolbar-short" />
                <ReactQuill
                    theme="snow"
                    value={form.shortDescription || ''}
                    onChange={(content) => handleFormChange({ target: { name: 'shortDescription', value: content } })}
                    formats={quillFormats}
                    modules={{ ...quillModules, toolbar: { container: '#toolbar-short', handlers: quillModules.toolbar.handlers } }}
                />
            </div>

            <div className={cx('field')}>
                <label>Mô tả chi tiết</label>
                <CustomToolbar id="toolbar-long" />
                <ReactQuill
                    theme="snow"
                    value={form.longDescription || ''}
                    onChange={(content) => handleFormChange({ target: { name: 'longDescription', value: content } })}
                    formats={quillFormats}
                    modules={{ ...quillModules, toolbar: { container: '#toolbar-long', handlers: quillModules.toolbar.handlers } }}
                />
            </div>

            <div className={cx('field', 'images')}>
                <label>Ảnh sản phẩm</label>
                {form.images.map((img, i) => (
                    <div className={cx('image-row')} key={i}>
                        <input
                            name={`image-${i}`}
                            value={img}
                            onChange={handleFormChange}
                            placeholder={`URL ảnh ${i + 1}`}
                        />
                        <button type="button" onClick={() => removeImageField(i)}>
                            X
                        </button>
                    </div>
                ))}
                <button type="button" className={cx('btn')} onClick={addImageField}>
                    + Thêm ảnh
                </button>
            </div>

            {productType === 'simple' && (
                <div className={cx('field-row')}>
                    <div className={cx('field')}>
                        <label>Giá gốc</label>
                        <input name="price" type="number" value={form.price} onChange={handleFormChange} />
                    </div>
                    <div className={cx('field')}>
                        <label>Giá khuyến mãi</label>
                        <input
                            name="discountPrice"
                            type="number"
                            value={form.discountPrice}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
