import React, { useState, useEffect } from 'react';
import styles from './CreatePostPage.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

import axiosClient from '~/utils/axiosClient';
import { successAlert, errorAlert } from '~/utils/alertSweet';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import QuoteBlot from '~/components/QuillBlots/QuoteBlot';
import ProductBlot from '~/components/QuillBlots/ProductBlot';

// Đăng ký module resize ảnh
Quill.register('modules/imageResize', ImageResize);
Quill.register(QuoteBlot);
Quill.register(ProductBlot);

const quillModules = {
    toolbar: {
        container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'], // blockquote gốc vẫn dùng được
            ['link', 'image'],
            ['clean'],
            ['insertQuote', 'insertProduct'], // 👈 nút custom
        ],
        handlers: {
            insertQuote: function () {
                const text = prompt('Nhập nội dung quote');
                const cite = prompt('Nhập tác giả');
                const range = this.quill.getSelection();
                if (range) {
                    this.quill.insertEmbed(
                        range.index,
                        'quote', // 👈 dùng custom blot
                        { text, cite },
                        Quill.sources.USER,
                    );
                }
            },
            insertProduct: function () {
                const name = prompt('Tên sản phẩm');
                const image = prompt('URL ảnh');
                const price = prompt('Giá sản phẩm');
                const link = prompt('Link sản phẩm (tùy chọn)');
                const range = this.quill.getSelection();
                if (range) {
                    this.quill.insertEmbed(range.index, 'product', { name, image, price, link }, Quill.sources.USER);
                }
            },
        },
    },
    imageResize: { parchment: Quill.import('parchment') },
};

const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'link',
    'image',
    'align',
    'color',
    'background',
];

const cx = classNames.bind(styles);

const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openTags, setOpenTags] = useState(false);

    const [image, setImage] = useState('');
    const [status, setStatus] = useState('draft'); // 👈 thêm state cho status
    const [openStatus, setOpenStatus] = useState(false);

    const navigate = useNavigate();

    const showToast = useToast();

    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/post-categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Lỗi load categories:', err);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await axiosClient.get('/post-tags');
            setTags(res.data);
        } catch (err) {
            console.error('Lỗi load tags:', err);
        }
    };

    const handleAddTag = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tag) => {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                content,
                category,
                tags: selectedTags,
                image,
                status, // 👈 gửi lên API
            };

            await axiosClient.post('/posts', payload);

            // successAlert("Bài viết đã được tạo!");
            showToast('Bài viết đã được tạo!', 'success');

            // Điều hướng theo status
            if (status === 'draft') {
                navigate('/admin/posts/drafts');
            } else if (status === 'trash') {
                navigate('/admin/posts/trash');
            } else {
                navigate('/admin/posts');
            }
        } catch (err) {
            console.error('❌ Lỗi tạo bài viết:', err);
            // errorAlert("Tạo bài viết thất bại!");
            showToast('Tạo bài viết thất bại!', 'error');
        }
    };

    return (
        <div className={cx('posts-page')}>
            <h1 className={cx('title')}>Viết bài mới</h1>

            <form onSubmit={handleSubmit} className={cx('post-form')}>
                {/* Ảnh đại diện */}
                <div className={cx('form-group')}>
                    <label>Ảnh đại diện</label>
                    <input
                        type="text"
                        placeholder="Dán link ảnh hoặc upload"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />
                </div>

                {/* Tiêu đề */}
                <div className={cx('form-group')}>
                    <label>Tiêu đề</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                {/* Nội dung */}
                <div className="form-group">
                    <label>Nội dung</label>
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        formats={[
                            'header',
                            'bold',
                            'italic',
                            'underline',
                            'strike',
                            'list',
                            'bullet',
                            'blockquote',
                            'code-block',
                            'link',
                            'image',
                            'align',
                            'color',
                            'background',
                            'quote',
                            'product', // thêm blot custom vào formats
                        ]}
                        theme="snow"
                        style={{ height: '400px', marginBottom: '50px' }}
                    />
                </div>

                {/* Danh mục */}
                <div className={cx('form-group')}>
                    <label>Chuyên mục</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenCategory(!openCategory)}>
                            {categories.find((c) => c._id === category)?.name || 'Chọn chuyên mục'}
                            <span className={cx('arrow')}>▼</span>
                        </div>

                        {openCategory && (
                            <ul className={cx('select-options')}>
                                {categories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => {
                                            setCategory(cat._id);
                                            setOpenCategory(false);
                                        }}
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Thẻ */}
                <div className={cx('form-group')}>
                    <label>Thẻ</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenTags(!openTags)}>
                            Thêm thẻ...
                            <span className={cx('arrow')}>▼</span>
                        </div>
                        {openTags && (
                            <ul className={cx('select-options')}>
                                {tags.map((tag) => (
                                    <li key={tag._id} onClick={() => handleAddTag(tag._id)}>
                                        {tag.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Hiển thị tags đã chọn */}
                    <div className={cx('selected-tags')}>
                        {selectedTags.map((tagId) => {
                            const tag = tags.find((t) => t._id === tagId);
                            return (
                                <span key={tagId} className={cx('tag-badge')}>
                                    {tag?.name || tagId}
                                    <button type="button" onClick={() => handleRemoveTag(tagId)}>
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Trạng thái */}
                <div className={cx('form-group')}>
                    <label>Trạng thái</label>
                    <div className={cx('custom-select')}>
                        <div className={cx('select-trigger')} onClick={() => setOpenStatus((prev) => !prev)}>
                            {status === 'draft' ? 'Bản nháp' : status === 'published' ? 'Xuất bản' : 'Thùng rác'}
                            <span className={cx('arrow')}>▼</span>
                        </div>

                        {openStatus && (
                            <ul className={cx('select-options')}>
                                <li
                                    onClick={() => {
                                        setStatus('draft');
                                        setOpenStatus(false);
                                    }}
                                >
                                    Bản nháp
                                </li>
                                <li
                                    onClick={() => {
                                        setStatus('published');
                                        setOpenStatus(false);
                                    }}
                                >
                                    Xuất bản
                                </li>
                                <li
                                    onClick={() => {
                                        setStatus('trash');
                                        setOpenStatus(false);
                                    }}
                                >
                                    Thùng rác
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className={cx('btn-submit')}>
                    Đăng bài
                </button>
            </form>
        </div>
    );
};

export default CreatePostPage;
