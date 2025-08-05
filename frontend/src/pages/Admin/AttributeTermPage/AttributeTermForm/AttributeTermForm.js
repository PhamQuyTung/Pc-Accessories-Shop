import React, { useState, useEffect } from 'react';
import styles from './AttributeTermForm.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function AttributeTermForm({
    initialData = null,
    onSubmit,
    onClose,
    loading,
    resetTrigger,
    attributeType, // <-- THÊM DÒNG NÀY
}) {
    console.log('💡 attributeType:', attributeType); // nên log để chắc chắn
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [color, setColor] = useState('#000000');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setSlug(initialData.slug || '');
            setColor(initialData.color || '#000000');
            setImageUrl(initialData.image || '');
        }
    }, [initialData]);

    useEffect(() => {
        if (!initialData) {
            setName('');
            setSlug('');
            setColor('#000000');
            setImageUrl('');
        }
    }, [resetTrigger]);

    const handleSubmit = (e) => {
        console.log('🧩 Term data trước khi tạo:', {
            attributeType,
            name,
            slug,
            color,
            imageUrl,
        });

        e.preventDefault();

        const trimmedName = String(name).trim();
        const trimmedSlug = String(slug).trim();

        if (!trimmedName || !trimmedSlug) {
            alert('Vui lòng nhập đầy đủ tên và slug.');
            return;
        }

        const payload = {
            name: trimmedName,
            slug: trimmedSlug,
        };

        console.log('📤 Payload gửi server:', payload);

        if (attributeType === 'color') {
            payload.color = color; // 👈 FIXED
        }

        if (attributeType === 'image') {
            payload.image = imageUrl; // 👈 FIXED (nếu backend dùng `image`, không phải `imageUrl`)
        }

        onSubmit(payload);
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

                {/* Nếu là color thì hiển thị trường chọn màu */}
                {attributeType === 'color' && (
                    <div className={cx('form-group')}>
                        <label htmlFor="color">Màu sắc</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                                setColor(e.target.value);
                                console.log('🎨 Color selected:', e.target.value);
                            }}
                        />
                    </div>
                )}

                {/* Nếu là image thì hiển thị trường nhập link hình ảnh (có thể sau này đổi sang upload file) */}
                {attributeType === 'image' && (
                    <div className={cx('form-group')}>
                        <label htmlFor="image">Link hình ảnh</label>
                        <input
                            type="text"
                            id="image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Nhập URL hình ảnh hoặc link từ CDN"
                        />
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Xem trước"
                                className={cx('preview')}
                                style={{ maxWidth: '100px', marginTop: '8px' }}
                            />
                        )}
                    </div>
                )}

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
