import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './DraftPostsPage.module.scss';
import classNames from 'classnames/bind';
import { confirmAlert } from '~/utils/alertSweet'; // 👈 confirm modal
import { useToast } from '~/components/ToastMessager/ToastMessager'; // 👈 toast

const cx = classNames.bind(styles);

const DraftPostsPage = () => {
    const [drafts, setDrafts] = useState([]);
    const showToast = useToast();

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const res = await axiosClient.get('/posts/drafts');
            setDrafts(res.data);
        } catch (err) {
            console.error('❌ Lỗi tải bản nháp:', err);
        }
    };

    // 👇 xử lý xóa (chuyển bài viết sang trash)
    const handleMoveToTrash = async (id) => {
        const result = await confirmAlert('Bạn chắc chắn?', 'Bài viết này sẽ được đưa vào thùng rác.', 'warning');

        if (!result.isConfirmed) return;

        try {
            await axiosClient.put(`/posts/${id}`, { status: 'trash' });
            setDrafts(drafts.filter((p) => p._id !== id));
            showToast('🗑️ Đã chuyển vào thùng rác!', 'success');
        } catch (err) {
            console.error('❌ Lỗi khi xóa:', err);
            showToast('Xóa thất bại!', 'error');
        }
    };

    return (
        <div className={cx('drafts-page')}>
            <h1 className={cx('title')}>Quản lý bản nháp</h1>

            {drafts.length === 0 ? (
                <p>Chưa có bản nháp nào.</p>
            ) : (
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Tác giả</th>
                            <th>Chuyên mục</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drafts.map((post) => (
                            <tr key={post._id}>
                                <td>
                                    {post.title}
                                </td>
                                <td>{post.author?.name}</td>
                                <td>{post.category?.name}</td>
                                <td>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <td>
                                        <Link to={`/admin/posts/preview/${post._id}`} className={cx('btn-preview')}>
                                            Xem trước
                                        </Link>
                                        <Link to={`/admin/posts/edit/${post._id}`} className={cx('btn-edit')}>
                                            Sửa
                                        </Link>
                                        <button
                                            className={cx('btn-delete')}
                                            onClick={() => handleMoveToTrash(post._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DraftPostsPage;
