import { useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './VariantImage.module.scss';

const cx = classNames.bind(styles);

export default function VariantImage({ v, i, handleVariantChange }) {
    const fileInputRef = useRef(null);

    return (
        <div className={cx('form-col', 'image')}>
            <label>Hình ảnh</label>
            <div className={cx('image-upload')}>
                {v.imagePreview ? (
                    <div className={cx('image-preview')} onClick={() => fileInputRef.current.click()}>
                        <img src={v.imagePreview} alt="Variant" />
                        <button
                            type="button"
                            className={cx('remove-image')}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVariantChange(i, 'image', null);
                                handleVariantChange(i, 'imagePreview', null);
                                fileInputRef.current.value = null; // reset input file
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className={cx('image-placeholder')} onClick={() => fileInputRef.current.click()}>
                        <span>+</span>
                        <p>Thêm ảnh</p>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            handleVariantChange(i, 'image', file);
                            handleVariantChange(i, 'imagePreview', URL.createObjectURL(file));
                        }
                    }}
                />
            </div>
        </div>
    );
}
