import React, { useState, useEffect } from 'react';
import styles from './AttributeTermForm.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function AttributeTermForm({ initialData = null, onSubmit, onClose, loading, resetTrigger }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setSlug(initialData.slug || '');
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setName('');
            setSlug('');
        }
    }, [resetTrigger]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = String(name).trim();
        const trimmedSlug = String(slug).trim();

        if (!trimmedName || !trimmedSlug) {
            alert('Vui lòng nhập đầy đủ tên và slug.');
            return;
        }

        const formData = {
            name: trimmedName,
            slug: trimmedSlug,
        };

        onSubmit(formData);
    };

    return (
        <div className={cx('form-wrapper')}>
            <form className={cx('form')} onSubmit={handleSubmit}>
                <div className={cx('form-group')}>
                    <label htmlFor="name">
                        Tên chủng loại <span className={cx('required')}>*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Đen, Trắng, 16GB, i5..."
                        required
                    />
                </div>

                <div className={cx('form-group')}>
                    <label htmlFor="slug">
                        Đường dẫn (slug) <span className={cx('required')}>*</span>
                    </label>
                    <input
                        type="text"
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="vi-du: den, trang, 16gb..."
                        required
                    />
                </div>

                <div className={cx('form-actions')}>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    <button type="button" className={cx('cancel-btn')} onClick={onClose}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
