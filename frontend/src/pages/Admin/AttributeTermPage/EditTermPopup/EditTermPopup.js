import React, { useEffect, useState } from 'react';
import styles from './EditTermPopup.module.scss';
import classNames from 'classnames/bind';
import { FaTimes } from 'react-icons/fa';

const cx = classNames.bind(styles);

export default function EditTermPopup({ term, onClose, onSave }) {
    const [name, setName] = useState(term.name);
    const [slug, setSlug] = useState(term.slug);

    useEffect(() => {
        setName(term.name);
        setSlug(term.slug);
    }, [term]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ ...term, name: name.trim(), slug: slug.trim() });
    };

    return (
        <div className={cx('overlay')}>
            <div className={cx('popup')}>
                <button className={cx('close')} onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Chỉnh sửa chủng loại</h2>
                <form onSubmit={handleSubmit}>
                    <div className={cx('formGroup')}>
                        <label>Tên *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label>Slug</label>
                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>
                    <div className={cx('actions')}>
                        <button type="submit" className={cx('saveBtn')}>
                            Lưu
                        </button>
                        <button type="button" onClick={onClose} className={cx('cancelBtn')}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
